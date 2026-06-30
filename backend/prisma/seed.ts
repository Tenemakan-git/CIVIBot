import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Rôles ──────────────────────────────────────────────────────────────
  const [citoyenRole, adminRole] = await Promise.all([
    prisma.role.upsert({ where: { nom: 'citoyen' }, update: {}, create: { nom: 'citoyen', description: 'Utilisateur standard' } }),
    prisma.role.upsert({ where: { nom: 'admin' }, update: {}, create: { nom: 'admin', description: 'Administrateur' } }),
    prisma.role.upsert({ where: { nom: 'super-admin' }, update: {}, create: { nom: 'super-admin', description: 'Super administrateur' } }),
  ]);

  // ── Utilisateurs ────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@civibot.ci' },
    update: {},
    create: { nom: 'Admin', prenom: 'CiviBot', email: 'admin@civibot.ci', passwordHash: adminHash, roleId: adminRole.id },
  });

  const demoHash = await bcrypt.hash('Demo1234!', 10);
  await prisma.user.upsert({
    where: { email: 'demo@civibot.ci' },
    update: {},
    create: { nom: 'Koné', prenom: 'Aminata', email: 'demo@civibot.ci', telephone: '0701000001', passwordHash: demoHash, roleId: citoyenRole.id },
  });

  // ── Domaines & Catégories ───────────────────────────────────────────────
  const etatCivil = await prisma.domaine.upsert({ where: { slug: 'etat-civil' }, update: {}, create: { nom: 'État civil', slug: 'etat-civil' } });
  const creation = await prisma.domaine.upsert({ where: { slug: 'creation-entreprise' }, update: {}, create: { nom: "Création d'entreprise", slug: 'creation-entreprise' } });

  const catNaissance = await prisma.categorie.upsert({ where: { slug: 'naissance' }, update: {}, create: { nom: 'Naissance', slug: 'naissance', domaineId: etatCivil.id } });
  const catMariage = await prisma.categorie.upsert({ where: { slug: 'mariage' }, update: {}, create: { nom: 'Mariage', slug: 'mariage', domaineId: etatCivil.id } });
  const catDeces = await prisma.categorie.upsert({ where: { slug: 'deces' }, update: {}, create: { nom: 'Décès', slug: 'deces', domaineId: etatCivil.id } });
  const catNationalite = await prisma.categorie.upsert({ where: { slug: 'nationalite' }, update: {}, create: { nom: 'Nationalité', slug: 'nationalite', domaineId: etatCivil.id } });
  const catSarl = await prisma.categorie.upsert({ where: { slug: 'sarl' }, update: {}, create: { nom: 'SARL', slug: 'sarl', domaineId: creation.id } });
  const catSa = await prisma.categorie.upsert({ where: { slug: 'sa' }, update: {}, create: { nom: 'SA', slug: 'sa', domaineId: creation.id } });
  const catEi = await prisma.categorie.upsert({ where: { slug: 'ei' }, update: {}, create: { nom: 'Entreprise Individuelle', slug: 'ei', domaineId: creation.id } });
  const catCoop = await prisma.categorie.upsert({ where: { slug: 'cooperative' }, update: {}, create: { nom: 'Coopérative', slug: 'cooperative', domaineId: creation.id } });

  // ── Helper pour créer une procédure si elle n'existe pas ────────────────
  async function upsertProcedure(slug: string, data: any) {
    const existing = await prisma.procedure.findFirst({ where: { categorieId: data.categorieId, titre: data.titre } });
    if (existing) return existing;
    return prisma.procedure.create({ data });
  }

  // ── PROCÉDURE 1 : Déclaration de naissance ─────────────────────────────
  const pNaissance = await upsertProcedure('declaration-naissance', {
    categorieId: catNaissance.id,
    titre: 'Déclaration de naissance',
    description: "La déclaration de naissance est obligatoire dans les 3 mois suivant l'accouchement en Côte d'Ivoire. Elle permet d'établir l'acte de naissance, document fondamental pour toute la vie administrative du citoyen.",
    cout: 'Gratuit',
    delai: '3 mois maximum après la naissance',
    eligibilite: 'Père, mère, médecin, sage-femme ou toute personne ayant assisté à la naissance',
    resume: "Déclarer une naissance auprès de l'officier d'état civil dans les 3 mois.",
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pNaissance.id, ordre: 1, titre: 'Réunir les documents', description: "Rassembler le certificat médical de naissance signé par le médecin ou la sage-femme, les pièces d'identité des parents et le livret de famille si disponible." },
    { procedureId: pNaissance.id, ordre: 2, titre: "Se rendre à la mairie ou au centre d'état civil", description: "Aller à la mairie de la localité où l'enfant est né, muni de tous les documents requis." },
    { procedureId: pNaissance.id, ordre: 3, titre: 'Remplir le formulaire de déclaration', description: "Compléter le formulaire de déclaration de naissance fourni par l'officier d'état civil." },
    { procedureId: pNaissance.id, ordre: 4, titre: "Signature de l'acte", description: "L'officier d'état civil établit et signe l'acte de naissance. Un extrait est remis au déclarant." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pNaissance.id, nom: "Certificat médical d'accouchement", obligatoire: true },
    { procedureId: pNaissance.id, nom: "Carte nationale d'identité du père", obligatoire: true },
    { procedureId: pNaissance.id, nom: "Carte nationale d'identité de la mère", obligatoire: true },
    { procedureId: pNaissance.id, nom: 'Livret de famille (si existant)', obligatoire: false },
    { procedureId: pNaissance.id, nom: 'Certificat de mariage des parents (si mariés)', obligatoire: false },
  ], skipDuplicates: true });

  await prisma.faq.createMany({ data: [
    { procedureId: pNaissance.id, question: "Que faire si la déclaration de naissance est tardive (après 3 mois) ?", reponse: "Au-delà de 3 mois, la déclaration nécessite un jugement supplétif d'acte de naissance auprès du tribunal de première instance. Il faut fournir un témoignage de deux personnes ayant assisté à la naissance." },
    { procedureId: pNaissance.id, question: "Peut-on déclarer la naissance sans le père ?", reponse: "Oui, la mère peut déclarer seule la naissance de l'enfant. La filiation maternelle sera établie automatiquement." },
    { procedureId: pNaissance.id, question: "La déclaration de naissance est-elle payante ?", reponse: "Non, la déclaration de naissance dans les délais légaux (3 mois) est totalement gratuite en Côte d'Ivoire." },
  ], skipDuplicates: true });

  await prisma.source.createMany({ data: [
    { procedureId: pNaissance.id, organisme: "Ministère de l'Intérieur et de la Sécurité de Côte d'Ivoire", url: 'https://www.interieur.gouv.ci', dateMiseAJour: new Date('2024-01-01') },
    { procedureId: pNaissance.id, organisme: "Mairie d'Abidjan", url: 'https://www.mairie-abidjan.ci', dateMiseAJour: new Date('2024-01-01') },
  ], skipDuplicates: true });

  // ── PROCÉDURE 2 : Mariage civil ────────────────────────────────────────
  const pMariage = await upsertProcedure('mariage-civil', {
    categorieId: catMariage.id,
    titre: 'Célébration du mariage civil',
    description: "Le mariage civil est l'union légale de deux personnes devant l'officier d'état civil. Il confère aux époux des droits et obligations mutuels reconnus par la loi ivoirienne.",
    cout: 'Entre 5 000 et 25 000 FCFA selon la commune',
    delai: '15 à 30 jours après dépôt du dossier',
    eligibilite: "Tout citoyen majeur (18 ans) ou mineur avec autorisation parentale. Les deux futurs époux doivent être célibataires ou divorcés/veufs.",
    resume: 'Se marier civilement devant un officier d\'état civil en Côte d\'Ivoire.',
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pMariage.id, ordre: 1, titre: 'Constitution du dossier', description: "Rassembler tous les documents requis pour les deux époux : actes de naissance, CNI, photos, certificats de célibat, etc." },
    { procedureId: pMariage.id, ordre: 2, titre: 'Dépôt du dossier à la mairie', description: "Déposer le dossier complet à la mairie du domicile de l'un des époux. Un récépissé de dépôt sera remis." },
    { procedureId: pMariage.id, ordre: 3, titre: 'Publication des bans', description: "Les bans sont publiés pendant 15 jours à la mairie pour permettre d'éventuelles oppositions au mariage." },
    { procedureId: pMariage.id, ordre: 4, titre: 'Cérémonie de mariage', description: "La cérémonie se tient en mairie en présence de 2 témoins majeurs minimum. L'officier d'état civil prononce l'union et remet l'acte de mariage." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pMariage.id, nom: "Acte de naissance de chaque époux (extrait)", obligatoire: true },
    { procedureId: pMariage.id, nom: "Carte nationale d'identité valide de chaque époux", obligatoire: true },
    { procedureId: pMariage.id, nom: '2 photos d\'identité récentes de chaque époux', obligatoire: true },
    { procedureId: pMariage.id, nom: 'Certificat de célibat (délivré par la mairie)', obligatoire: true },
    { procedureId: pMariage.id, nom: 'Pièce d\'identité des 2 témoins (minimum)', obligatoire: true },
    { procedureId: pMariage.id, nom: 'Certificat médical prénuptial (obligatoire)', obligatoire: true },
    { procedureId: pMariage.id, nom: 'Jugement de divorce ou acte de décès (si applicable)', obligatoire: false },
  ], skipDuplicates: true });

  await prisma.faq.createMany({ data: [
    { procedureId: pMariage.id, question: 'Quel est le délai entre le dépôt du dossier et la cérémonie ?', reponse: 'Au minimum 15 jours sont nécessaires pour la publication des bans. En général comptez 3 à 4 semaines.' },
    { procedureId: pMariage.id, question: 'Un étranger peut-il se marier civilement en Côte d\'Ivoire ?', reponse: 'Oui, sous réserve de fournir les documents équivalents de son pays d\'origine, traduits et légalisés.' },
  ], skipDuplicates: true });

  // ── PROCÉDURE 3 : Déclaration de décès ────────────────────────────────
  const pDeces = await upsertProcedure('declaration-deces', {
    categorieId: catDeces.id,
    titre: 'Déclaration de décès',
    description: "La déclaration de décès doit être effectuée dans les 24 heures suivant le décès auprès de l'officier d'état civil du lieu du décès.",
    cout: 'Gratuit',
    delai: '24 heures maximum après le décès',
    eligibilite: "Membres de la famille du défunt, médecin ayant constaté le décès, ou toute personne possédant des renseignements sur l'état civil du défunt.",
    resume: "Déclarer le décès d'une personne auprès de l'état civil dans les 24 heures.",
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pDeces.id, ordre: 1, titre: 'Constater le décès médicalement', description: "Un médecin établit le certificat médical de décès indiquant la cause du décès." },
    { procedureId: pDeces.id, ordre: 2, titre: "Se rendre à la mairie ou au centre d'état civil", description: "Se présenter à la mairie du lieu du décès avec tous les documents." },
    { procedureId: pDeces.id, ordre: 3, titre: "Remettre les documents à l'officier", description: "L'officier d'état civil établit l'acte de décès et remet plusieurs copies aux déclarants." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pDeces.id, nom: 'Certificat médical de décès', obligatoire: true },
    { procedureId: pDeces.id, nom: "Pièce d'identité du défunt (CNI ou passeport)", obligatoire: true },
    { procedureId: pDeces.id, nom: "Pièce d'identité du déclarant", obligatoire: true },
    { procedureId: pDeces.id, nom: 'Livret de famille (si disponible)', obligatoire: false },
  ], skipDuplicates: true });

  await prisma.faq.createMany({ data: [
    { procedureId: pDeces.id, question: 'Combien de copies de l\'acte de décès recevoir ?', reponse: 'Il est conseillé de demander au minimum 5 à 10 copies car elles sont nécessaires pour de nombreuses démarches : banque, succession, employeur, retraite, etc.' },
    { procedureId: pDeces.id, question: 'Que faire en cas de décès à l\'étranger ?', reponse: 'Le décès doit être déclaré aux autorités locales puis transcrit en Côte d\'Ivoire via l\'ambassade ou le consulat ivoirien du pays concerné.' },
  ], skipDuplicates: true });

  // ── PROCÉDURE 4 : Certificat de nationalité ───────────────────────────
  const pNationalite = await upsertProcedure('certificat-nationalite', {
    categorieId: catNationalite.id,
    titre: 'Obtention du certificat de nationalité ivoirienne',
    description: "Le certificat de nationalité ivoirienne atteste de la nationalité ivoirienne d'une personne. Il est délivré par le tribunal de première instance et est requis pour de nombreuses démarches (passeport, emploi public, etc.).",
    cout: 'Environ 1 000 à 3 000 FCFA (timbres fiscaux)',
    delai: '15 à 30 jours',
    eligibilite: 'Tout citoyen ivoirien ou ayant droit à la nationalité ivoirienne selon les conditions du Code de la nationalité.',
    resume: 'Obtenir un certificat prouvant la nationalité ivoirienne auprès du tribunal.',
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pNationalite.id, ordre: 1, titre: 'Constitution du dossier', description: "Rassembler tous les documents prouvant la nationalité ivoirienne : acte de naissance, CNI des parents, etc." },
    { procedureId: pNationalite.id, ordre: 2, titre: 'Dépôt au greffe du tribunal', description: "Déposer le dossier au greffe du tribunal de première instance territorialement compétent et payer les frais de timbre." },
    { procedureId: pNationalite.id, ordre: 3, titre: 'Instruction du dossier', description: "Le greffier instruit le dossier et vérifie les pièces. Un délai de 15 à 30 jours est généralement nécessaire." },
    { procedureId: pNationalite.id, ordre: 4, titre: 'Retrait du certificat', description: "Se présenter au greffe avec le récépissé pour retirer le certificat de nationalité signé par le greffier en chef." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pNationalite.id, nom: 'Acte de naissance de l\'intéressé', obligatoire: true },
    { procedureId: pNationalite.id, nom: 'CNI de l\'intéressé (ou acte de naissance si mineur)', obligatoire: true },
    { procedureId: pNationalite.id, nom: 'Acte de naissance du père', obligatoire: true },
    { procedureId: pNationalite.id, nom: 'CNI ou passeport du père', obligatoire: true },
    { procedureId: pNationalite.id, nom: 'Acte de mariage des parents', obligatoire: false },
    { procedureId: pNationalite.id, nom: 'Timbres fiscaux', obligatoire: true, remarque: 'Valeur selon les frais de tribunal' },
  ], skipDuplicates: true });

  await prisma.faq.createMany({ data: [
    { procedureId: pNationalite.id, question: 'Quelle est la différence entre le certificat de nationalité et la carte nationale d\'identité ?', reponse: 'La CNI est un document d\'identité délivré par l\'administration, tandis que le certificat de nationalité est un acte juridique délivré par un juge ou greffier attestant la nationalité ivoirienne.' },
    { procedureId: pNationalite.id, question: 'Peut-on avoir la double nationalité en Côte d\'Ivoire ?', reponse: 'Oui, la Côte d\'Ivoire reconnaît la double nationalité. Toutefois, les droits et obligations de chaque nationalité restent distincts.' },
  ], skipDuplicates: true });

  // ── PROCÉDURE 5 : Création d'une SARL ─────────────────────────────────
  const pSarl = await upsertProcedure('creation-sarl', {
    categorieId: catSarl.id,
    titre: "Création d'une SARL (Société à Responsabilité Limitée)",
    description: "La SARL est la forme juridique la plus courante pour les PME en Côte d'Ivoire. Elle limite la responsabilité des associés à leurs apports. Le capital minimum est de 100 000 FCFA. Elle peut être créée par 1 à 50 associés.",
    cout: 'Entre 150 000 et 400 000 FCFA (frais notaire, CEPICI, immatriculation)',
    delai: '72 heures via le CEPICI (guichet unique)',
    eligibilite: 'Toute personne physique ou morale, nationale ou étrangère, avec un capital minimum de 100 000 FCFA.',
    resume: 'Créer une SARL en Côte d\'Ivoire via le CEPICI en 72h.',
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pSarl.id, ordre: 1, titre: 'Choisir la dénomination sociale', description: "Vérifier la disponibilité du nom de l'entreprise auprès du Registre du Commerce et du Crédit Mobilier (RCCM) ou via le CEPICI." },
    { procedureId: pSarl.id, ordre: 2, titre: 'Rédiger et signer les statuts', description: "Rédiger les statuts de la SARL chez un notaire. Ils doivent préciser : dénomination, objet social, siège, capital, parts sociales, gérance." },
    { procedureId: pSarl.id, ordre: 3, titre: 'Déposer le capital social en banque', description: "Ouvrir un compte bancaire au nom de la société en formation et y déposer le capital social (minimum 100 000 FCFA). La banque remet une attestation de dépôt." },
    { procedureId: pSarl.id, ordre: 4, titre: 'Déposer le dossier au CEPICI', description: "Déposer le dossier complet au Centre de Promotion des Investissements en Côte d'Ivoire (CEPICI) ou via le guichet unique. Payer les frais d'enregistrement." },
    { procedureId: pSarl.id, ordre: 5, titre: 'Obtenir le registre du commerce (RCCM)', description: "Le CEPICI traite le dossier en 72h et délivre l'extrait RCCM, le numéro de contribuable (DGI) et le numéro CNPS." },
    { procedureId: pSarl.id, ordre: 6, titre: 'Publier dans un journal d\'annonces légales', description: "Publier un avis de constitution dans un journal d'annonces légales habilité (ex: Fraternité Matin)." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pSarl.id, nom: 'Statuts de la société (acte notarié)', obligatoire: true },
    { procedureId: pSarl.id, nom: 'Attestation de dépôt du capital en banque', obligatoire: true },
    { procedureId: pSarl.id, nom: "CNI ou passeport de chaque associé et du gérant", obligatoire: true },
    { procedureId: pSarl.id, nom: 'Photos d\'identité du gérant (2 copies)', obligatoire: true },
    { procedureId: pSarl.id, nom: 'Formulaire de déclaration au CEPICI', obligatoire: true },
    { procedureId: pSarl.id, nom: 'Justificatif de domicile du siège social', obligatoire: true },
    { procedureId: pSarl.id, nom: 'Casier judiciaire du gérant (bulletin n°3)', obligatoire: true },
    { procedureId: pSarl.id, nom: 'Acte de propriété ou bail commercial du siège', obligatoire: false },
  ], skipDuplicates: true });

  await prisma.faq.createMany({ data: [
    { procedureId: pSarl.id, question: 'Quel est le capital minimum pour créer une SARL en Côte d\'Ivoire ?', reponse: 'Le capital minimum est de 100 000 FCFA. Il n\'y a pas de capital maximum. Ce capital peut être constitué d\'apports en numéraire (argent) ou en nature (biens).' },
    { procedureId: pSarl.id, question: 'Combien de temps faut-il pour créer une SARL au CEPICI ?', reponse: 'Le CEPICI s\'engage à traiter les dossiers complets en 72 heures ouvrables grâce au guichet unique. En pratique, comptez 3 à 5 jours.' },
    { procedureId: pSarl.id, question: 'Un seul associé peut-il créer une SARL ?', reponse: 'Oui, depuis la réforme OHADA, une seule personne peut créer une SARL (appelée SARLU - SARL Unipersonnelle). Elle reste la seule associée et gérante.' },
    { procedureId: pSarl.id, question: 'Quelle est la différence entre SARL et SA ?', reponse: 'La SA (Société Anonyme) nécessite un capital minimum de 10 millions FCFA et convient aux grandes structures avec des actionnaires multiples. La SARL est plus adaptée aux PME avec un capital minimum de 100 000 FCFA.' },
    { procedureId: pSarl.id, question: 'Doit-on obligatoirement passer par un notaire pour créer une SARL ?', reponse: 'Les statuts d\'une SARL doivent être établis par acte notarié en Côte d\'Ivoire. Un notaire est donc obligatoire pour authentifier les statuts.' },
  ], skipDuplicates: true });

  await prisma.source.createMany({ data: [
    { procedureId: pSarl.id, organisme: 'CEPICI - Centre de Promotion des Investissements en Côte d\'Ivoire', url: 'https://www.cepici.gouv.ci', dateMiseAJour: new Date('2024-01-01') },
    { procedureId: pSarl.id, organisme: 'Chambre de Commerce et d\'Industrie de Côte d\'Ivoire', url: 'https://www.cci.ci', dateMiseAJour: new Date('2024-01-01') },
  ], skipDuplicates: true });

  // ── PROCÉDURE 6 : Création d'une SA ────────────────────────────────────
  const pSa = await upsertProcedure('creation-sa', {
    categorieId: catSa.id,
    titre: "Création d'une SA (Société Anonyme)",
    description: "La SA est destinée aux grandes entreprises avec plusieurs actionnaires. Elle nécessite un capital minimum de 10 millions FCFA et au minimum 2 actionnaires (ou 1 pour la SAS). Elle peut faire appel public à l'épargne.",
    cout: 'Entre 500 000 et 1 500 000 FCFA',
    delai: '1 à 2 semaines',
    eligibilite: 'Au minimum 2 actionnaires, capital minimum de 10 000 000 FCFA.',
    resume: 'Créer une Société Anonyme pour les grandes structures commerciales.',
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pSa.id, ordre: 1, titre: 'Rédaction des statuts chez le notaire', description: "Les statuts d'une SA sont obligatoirement rédigés par acte notarié. Ils définissent la gouvernance, le capital, les actions." },
    { procedureId: pSa.id, ordre: 2, titre: 'Assemblée constitutive', description: "Réunion des actionnaires fondateurs pour approuver les statuts, nommer le conseil d'administration et les commissaires aux comptes." },
    { procedureId: pSa.id, ordre: 3, titre: 'Dépôt du capital', description: "Ouverture d'un compte bancaire et dépôt du capital minimum (10 000 000 FCFA). Obtention de l'attestation de dépôt." },
    { procedureId: pSa.id, ordre: 4, titre: 'Immatriculation au CEPICI / RCCM', description: "Dépôt du dossier au CEPICI pour immatriculation au Registre du Commerce et obtention du numéro de contribuable." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pSa.id, nom: 'Statuts (acte notarié)', obligatoire: true },
    { procedureId: pSa.id, nom: 'Liste des actionnaires avec CNI/Passeport', obligatoire: true },
    { procedureId: pSa.id, nom: 'Attestation de dépôt du capital (10 000 000 FCFA min.)', obligatoire: true },
    { procedureId: pSa.id, nom: 'PV de l\'assemblée constitutive', obligatoire: true },
    { procedureId: pSa.id, nom: 'Nomination du PDG / Directeur Général', obligatoire: true },
  ], skipDuplicates: true });

  // ── PROCÉDURE 7 : Entreprise Individuelle ─────────────────────────────
  const pEi = await upsertProcedure('creation-ei', {
    categorieId: catEi.id,
    titre: 'Création d\'une Entreprise Individuelle (EI)',
    description: "L'entreprise individuelle est la forme la plus simple d'activité commerciale. L'entrepreneur est seul propriétaire et sa responsabilité est illimitée. Aucun capital minimum n'est requis.",
    cout: 'Entre 30 000 et 80 000 FCFA',
    delai: '24 à 72 heures via le CEPICI',
    eligibilite: 'Toute personne physique majeure souhaitant exercer une activité commerciale à titre individuel.',
    resume: 'Créer une activité commerciale à titre personnel, sans associés.',
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pEi.id, ordre: 1, titre: 'Choisir l\'activité commerciale', description: "Définir clairement l'activité principale. Certaines activités réglementées nécessitent des autorisations spéciales (pharmacie, transport, etc.)." },
    { procedureId: pEi.id, ordre: 2, titre: 'Déposer le dossier au CEPICI', description: "Déposer le formulaire de déclaration d'activité commerciale avec les pièces requises. Les frais sont minimes." },
    { procedureId: pEi.id, ordre: 3, titre: 'Obtenir le registre du commerce', description: "Le CEPICI délivre l'extrait RCCM, l'attestation DGI (numéro de contribuable) et l'affiliation CNPS." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pEi.id, nom: "CNI ou Passeport de l'entrepreneur", obligatoire: true },
    { procedureId: pEi.id, nom: '2 photos d\'identité', obligatoire: true },
    { procedureId: pEi.id, nom: 'Justificatif de domicile', obligatoire: true },
    { procedureId: pEi.id, nom: 'Formulaire de déclaration (CEPICI)', obligatoire: true },
    { procedureId: pEi.id, nom: 'Casier judiciaire (bulletin n°3)', obligatoire: true },
  ], skipDuplicates: true });

  await prisma.faq.createMany({ data: [
    { procedureId: pEi.id, question: 'Quelle est la différence entre une EI et une SARL unipersonnelle ?', reponse: 'Dans une EI, l\'entrepreneur est responsable sur ses biens personnels. Dans une SARLU, la responsabilité est limitée aux apports. La SARLU offre donc une meilleure protection du patrimoine personnel.' },
    { procedureId: pEi.id, question: 'Peut-on embaucher des salariés dans une entreprise individuelle ?', reponse: 'Oui, l\'entrepreneur individuel peut embaucher des salariés. Il doit s\'inscrire à la CNPS et respecter le droit du travail ivoirien.' },
  ], skipDuplicates: true });

  // ── PROCÉDURE 8 : Coopérative ──────────────────────────────────────────
  const pCoop = await upsertProcedure('creation-cooperative', {
    categorieId: catCoop.id,
    titre: 'Création d\'une Coopérative',
    description: "La coopérative est une société de personnes fondée sur les valeurs de solidarité. Elle est régie par la loi n°97-721 du 23 décembre 1997 et soumise à l'autorité du MEMEASFP. Minimum 7 membres fondateurs.",
    cout: 'Entre 50 000 et 200 000 FCFA',
    delai: '1 à 3 mois (instruction du dossier)',
    eligibilite: 'Minimum 7 membres fondateurs, personnes physiques ou morales partageant un projet commun.',
    resume: 'Constituer une coopérative agricole, d\'épargne ou de services en Côte d\'Ivoire.',
    actif: true,
  });

  await prisma.procedureStep.createMany({ data: [
    { procedureId: pCoop.id, ordre: 1, titre: 'Réunion des membres fondateurs', description: "Au moins 7 membres se réunissent pour définir l'objet, les statuts et élire le bureau provisoire." },
    { procedureId: pCoop.id, ordre: 2, titre: 'Rédaction des statuts et règlement intérieur', description: "Rédiger les statuts conformément à la loi n°97-721 et établir le règlement intérieur de la coopérative." },
    { procedureId: pCoop.id, ordre: 3, titre: 'Dépôt du dossier au MEMEASFP', description: "Déposer le dossier auprès du Ministère en charge des Coopératives pour obtenir l'agrément officiel." },
    { procedureId: pCoop.id, ordre: 4, titre: 'Immatriculation', description: "Après obtention de l'agrément, immatriculer la coopérative au RCCM et obtenir le numéro de contribuable." },
  ], skipDuplicates: true });

  await prisma.requiredDocument.createMany({ data: [
    { procedureId: pCoop.id, nom: 'Statuts signés par tous les membres fondateurs', obligatoire: true },
    { procedureId: pCoop.id, nom: 'Règlement intérieur', obligatoire: true },
    { procedureId: pCoop.id, nom: 'PV de l\'assemblée constitutive', obligatoire: true },
    { procedureId: pCoop.id, nom: 'Liste des membres avec CNI et contacts', obligatoire: true },
    { procedureId: pCoop.id, nom: 'Justificatif du siège social', obligatoire: true },
  ], skipDuplicates: true });

  // ── Base de connaissance (textes RAG) ──────────────────────────────────
  const docSarl = await prisma.knowledgeDocument.upsert({
    where: { id: 'doc-sarl-ohada' },
    update: {},
    create: {
      id: 'doc-sarl-ohada',
      titre: 'Guide complet création SARL en Côte d\'Ivoire - OHADA',
      fichier: 'guide-sarl-ci.pdf',
      version: '2024',
      categorie: 'creation-entreprise',
      organisme: 'CEPICI / OHADA',
      actif: true,
    },
  });

  const docEtatCivil = await prisma.knowledgeDocument.upsert({
    where: { id: 'doc-etat-civil-ci' },
    update: {},
    create: {
      id: 'doc-etat-civil-ci',
      titre: "Procédures d'état civil en Côte d'Ivoire",
      fichier: 'etat-civil-ci.pdf',
      version: '2024',
      categorie: 'etat-civil',
      organisme: "Ministère de l'Intérieur",
      actif: true,
    },
  });

  // Chunks de texte (sans embeddings — à générer via l'API Voyage AI)
  const chunks = [
    {
      documentId: docSarl.id,
      texte: "La SARL (Société à Responsabilité Limitée) est la forme juridique la plus répandue en Côte d'Ivoire pour les PME. Selon l'Acte Uniforme OHADA sur les sociétés commerciales, une SARL peut être constituée par une ou plusieurs personnes physiques ou morales. Le capital social minimum est fixé à 100 000 FCFA. La responsabilité des associés est limitée à leurs apports. Les associés ne peuvent pas être au nombre de plus de 50.",
      page: 1, ordre: 1,
    },
    {
      documentId: docSarl.id,
      texte: "Pour créer une SARL en Côte d'Ivoire via le CEPICI, les étapes sont : 1) Vérification de la disponibilité du nom commercial ; 2) Rédaction des statuts chez un notaire ; 3) Dépôt du capital social en banque (minimum 100 000 FCFA) ; 4) Constitution du dossier CEPICI ; 5) Dépôt au guichet unique CEPICI ; 6) Obtention de l'extrait RCCM, du numéro DGI et du numéro CNPS. Le délai de traitement est de 72 heures ouvrables.",
      page: 2, ordre: 2,
    },
    {
      documentId: docSarl.id,
      texte: "Documents requis pour créer une SARL au CEPICI : statuts notariés, attestation de dépôt de capital bancaire, CNI ou passeport de chaque associé et du gérant, 2 photos d'identité du gérant, formulaire CEPICI dûment rempli, justificatif du siège social (bail ou titre de propriété), casier judiciaire (bulletin n°3) du gérant datant de moins de 3 mois. Les frais d'enregistrement et de notaire varient entre 150 000 et 400 000 FCFA.",
      page: 3, ordre: 3,
    },
    {
      documentId: docSarl.id,
      texte: "La SARLU (SARL Unipersonnelle) permet à un seul associé de créer une société à responsabilité limitée. C'est idéal pour les entrepreneurs souhaitant séparer leur patrimoine personnel de leur activité professionnelle tout en gardant le contrôle total de l'entreprise. Le gérant peut être l'associé unique lui-même. Le capital minimum reste de 100 000 FCFA.",
      page: 4, ordre: 4,
    },
    {
      documentId: docSarl.id,
      texte: "La Société Anonyme (SA) en Côte d'Ivoire est réservée aux grandes entreprises. Capital minimum : 10 000 000 FCFA. Minimum 2 actionnaires (ou 1 pour la SAS). Nécessite un conseil d'administration et des commissaires aux comptes. Peut faire appel public à l'épargne via la BRVM. Les frais de création sont plus élevés : entre 500 000 et 1 500 000 FCFA.",
      page: 5, ordre: 5,
    },
    {
      documentId: docEtatCivil.id,
      texte: "La déclaration de naissance en Côte d'Ivoire doit être effectuée dans les 3 mois suivant l'accouchement auprès de l'officier d'état civil du lieu de naissance. Au-delà de ce délai, un jugement supplétif d'acte de naissance est nécessaire. La déclaration est gratuite. Documents requis : certificat médical d'accouchement, CNI des deux parents, livret de famille si disponible.",
      page: 1, ordre: 1,
    },
    {
      documentId: docEtatCivil.id,
      texte: "Le mariage civil en Côte d'Ivoire est célébré devant l'officier d'état civil après publication des bans pendant 15 jours. Les conditions : être majeur (18 ans), présenter un certificat médical prénuptial, un certificat de célibat, les actes de naissance des deux époux, les CNI valides et la présence de 2 témoins. Les coûts varient de 5 000 à 25 000 FCFA selon la commune.",
      page: 2, ordre: 2,
    },
    {
      documentId: docEtatCivil.id,
      texte: "Le certificat de nationalité ivoirienne est délivré par le greffe du tribunal de première instance. Il atteste la nationalité ivoirienne selon les dispositions du Code de la nationalité (Loi n°61-415 du 14 décembre 1961 modifiée). Est ivoirien : tout enfant né de père ivoirien, tout enfant né de mère ivoirienne si le père est inconnu ou apatride, toute personne naturalisée. Le délai est de 15 à 30 jours.",
      page: 3, ordre: 3,
    },
    {
      documentId: docEtatCivil.id,
      texte: "La déclaration de décès doit intervenir dans les 24 heures suivant le décès. Elle se fait à la mairie ou au centre d'état civil du lieu du décès. Le déclarant remet le certificat médical de décès et la CNI du défunt. L'officier établit l'acte de décès. Il est conseillé d'en demander plusieurs copies (minimum 5 à 10) car elles sont nécessaires pour les démarches successorales, bancaires et administratives.",
      page: 4, ordre: 4,
    },
    {
      documentId: docEtatCivil.id,
      texte: "L'entreprise individuelle (EI) est la structure la plus simple pour exercer une activité commerciale en Côte d'Ivoire. Aucun capital minimum n'est requis. L'entrepreneur est personnellement responsable de toutes les dettes. L'immatriculation se fait via le CEPICI (guichet unique) en 24 à 72 heures. Coût estimé : 30 000 à 80 000 FCFA. Idéale pour les artisans, commerçants individuels et prestataires de services.",
      page: 5, ordre: 5,
    },
  ];

  for (const chunk of chunks) {
    const existing = await prisma.knowledgeChunk.findFirst({
      where: { documentId: chunk.documentId, ordre: chunk.ordre },
    });
    if (!existing) {
      // On insère sans embedding pour la simulation
      const zeroVec = '[' + Array(1024).fill('0').join(',') + ']';
      await prisma.$executeRaw`
        INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, page, ordre)
        VALUES (gen_random_uuid(), ${chunk.documentId}, ${chunk.texte}, ${zeroVec}::vector(1024), ${chunk.page}, ${chunk.ordre})
      `;
    }
  }

  // ── FAQs générales (sans procédure liée) ──────────────────────────────
  await prisma.faq.createMany({ data: [
    { procedureId: null, question: "Comment puis-je obtenir ma carte nationale d'identité en Côte d'Ivoire ?", reponse: "La CNI est délivrée par l'Office National de l'État Civil (ONECI). Vous devez vous rendre dans un centre ONECI avec : acte de naissance, certificat de nationalité, 2 photos d'identité. Le délai est d'environ 2 à 4 semaines. Coût : environ 5 000 FCFA." },
    { procedureId: null, question: 'Qu\'est-ce que le CEPICI ?', reponse: "Le CEPICI (Centre de Promotion des Investissements en Côte d'Ivoire) est le guichet unique pour la création d'entreprises en Côte d'Ivoire. Il regroupe tous les services nécessaires (RCCM, DGI, CNPS, INS) en un seul endroit, permettant de créer une entreprise en 72 heures." },
    { procedureId: null, question: 'Quelle est la différence entre le RCCM et le numéro de contribuable ?', reponse: "Le RCCM (Registre du Commerce et du Crédit Mobilier) est le numéro d'immatriculation commerciale délivré par le tribunal. Le numéro de contribuable est délivré par la Direction Générale des Impôts (DGI) pour identifier fiscalement l'entreprise. Les deux sont obtenus simultanément via le CEPICI." },
    { procedureId: null, question: 'Qu\'est-ce que l\'OHADA ?', reponse: "L'OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires) est un traité regroupant 17 pays africains dont la Côte d'Ivoire. Elle harmonise le droit des affaires avec des actes uniformes applicables dans tous les pays membres, dont l'Acte Uniforme sur les sociétés commerciales." },
  ], skipDuplicates: true });

  // ── Paramètres IA ──────────────────────────────────────────────────────
  const existing = await prisma.aiSettings.findFirst();
  if (!existing) {
    await prisma.aiSettings.create({
      data: {
        modele: 'claude-sonnet-4-6',
        temperature: 0.7,
        maxTokens: 1024,
        topK: 5,
        seuilSimilarite: 0.45,
        promptSysteme: "Tu es CiviBot, un assistant administratif expert pour les citoyens de Côte d'Ivoire. Tu aides à comprendre et accomplir les procédures d'état civil (naissance, mariage, décès, nationalité) et de création d'entreprise (SARL, SA, EI, Coopérative). Réponds toujours en français, de manière claire, structurée et précise. Cite les coûts, délais et documents requis lorsque tu les connais. Si tu n'es pas sûr, dis-le honnêtement et recommande de consulter les autorités compétentes (CEPICI, mairie, ONECI, tribunal). Adapte ton langage pour être compris par tous les citoyens.",
      },
    });
  }

  console.log('✅ Seed terminé avec succès — Données de simulation chargées');
  console.log('   → Utilisateurs : admin@civibot.ci / Admin123! | demo@civibot.ci / Demo1234!');
  console.log('   → 8 catégories, 8 procédures, étapes, documents, FAQs');
  console.log('   → 2 documents RAG avec 10 chunks de texte');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
