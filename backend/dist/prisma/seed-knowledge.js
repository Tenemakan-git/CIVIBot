"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL = process.env.VOYAGE_MODEL || 'voyage-3';
const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings';
const BATCH = 64;
async function embedBatch(texts) {
    if (texts.length === 0)
        return [];
    const res = await fetch(VOYAGE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${VOYAGE_API_KEY}`,
        },
        body: JSON.stringify({ model: VOYAGE_MODEL, input: texts }),
    });
    if (!res.ok) {
        throw new Error(`Voyage AI a répondu ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json());
    return data.data.map((d) => d.embedding);
}
const CORPUS = [
    {
        id: 'doc-sarl-ohada',
        titre: "Guide complet création SARL en Côte d'Ivoire - OHADA",
        fichier: 'guide-sarl-ci.pdf',
        version: '2024',
        categorie: 'creation-entreprise',
        organisme: 'CEPICI / OHADA',
        chunks: [
            "La SARL (Société à Responsabilité Limitée) est la forme juridique la plus répandue en Côte d'Ivoire pour les PME. Selon l'Acte Uniforme OHADA sur les sociétés commerciales, une SARL peut être constituée par une ou plusieurs personnes physiques ou morales. Le capital social minimum est fixé à 100 000 FCFA. La responsabilité des associés est limitée à leurs apports. Les associés ne peuvent pas être au nombre de plus de 50.",
            "Pour créer une SARL en Côte d'Ivoire via le CEPICI, les étapes sont : 1) Vérification de la disponibilité du nom commercial ; 2) Rédaction des statuts chez un notaire ; 3) Dépôt du capital social en banque (minimum 100 000 FCFA) ; 4) Constitution du dossier CEPICI ; 5) Dépôt au guichet unique CEPICI ; 6) Obtention de l'extrait RCCM, du numéro DGI et du numéro CNPS. Le délai de traitement est de 72 heures ouvrables.",
            "Documents requis pour créer une SARL au CEPICI : statuts notariés, attestation de dépôt de capital bancaire, CNI ou passeport de chaque associé et du gérant, 2 photos d'identité du gérant, formulaire CEPICI dûment rempli, justificatif du siège social (bail ou titre de propriété), casier judiciaire (bulletin n°3) du gérant datant de moins de 3 mois. Les frais d'enregistrement et de notaire varient entre 150 000 et 400 000 FCFA.",
            "La SARLU (SARL Unipersonnelle) permet à un seul associé de créer une société à responsabilité limitée. C'est idéal pour les entrepreneurs souhaitant séparer leur patrimoine personnel de leur activité professionnelle tout en gardant le contrôle total de l'entreprise. Le gérant peut être l'associé unique lui-même. Le capital minimum reste de 100 000 FCFA.",
            "La Société Anonyme (SA) en Côte d'Ivoire est réservée aux grandes entreprises. Capital minimum : 10 000 000 FCFA. Minimum 2 actionnaires (ou 1 pour la SAS). Nécessite un conseil d'administration et des commissaires aux comptes. Peut faire appel public à l'épargne via la BRVM. Les frais de création sont plus élevés : entre 500 000 et 1 500 000 FCFA.",
        ],
    },
    {
        id: 'doc-etat-civil-ci',
        titre: "Procédures d'état civil en Côte d'Ivoire",
        fichier: 'etat-civil-ci.pdf',
        version: '2024',
        categorie: 'etat-civil',
        organisme: "Ministère de l'Intérieur",
        chunks: [
            "La déclaration de naissance en Côte d'Ivoire doit être effectuée dans les 3 mois suivant l'accouchement auprès de l'officier d'état civil du lieu de naissance. Au-delà de ce délai, un jugement supplétif d'acte de naissance est nécessaire. La déclaration est gratuite. Documents requis : certificat médical d'accouchement, CNI des deux parents, livret de famille si disponible.",
            "Le mariage civil en Côte d'Ivoire est célébré devant l'officier d'état civil après publication des bans pendant 15 jours. Les conditions : être majeur (18 ans), présenter un certificat médical prénuptial, un certificat de célibat, les actes de naissance des deux époux, les CNI valides et la présence de 2 témoins. Les coûts varient de 5 000 à 25 000 FCFA selon la commune.",
            "Le certificat de nationalité ivoirienne est délivré par le greffe du tribunal de première instance. Il atteste la nationalité ivoirienne selon les dispositions du Code de la nationalité (Loi n°61-415 du 14 décembre 1961 modifiée). Est ivoirien : tout enfant né de père ivoirien, tout enfant né de mère ivoirienne si le père est inconnu ou apatride, toute personne naturalisée. Le délai est de 15 à 30 jours.",
            "La déclaration de décès doit intervenir dans les 24 heures suivant le décès. Elle se fait à la mairie ou au centre d'état civil du lieu du décès. Le déclarant remet le certificat médical de décès et la CNI du défunt. L'officier établit l'acte de décès. Il est conseillé d'en demander plusieurs copies (minimum 5 à 10) car elles sont nécessaires pour les démarches successorales, bancaires et administratives.",
            "L'entreprise individuelle (EI) est la structure la plus simple pour exercer une activité commerciale en Côte d'Ivoire. Aucun capital minimum n'est requis. L'entrepreneur est personnellement responsable de toutes les dettes. L'immatriculation se fait via le CEPICI (guichet unique) en 24 à 72 heures. Coût estimé : 30 000 à 80 000 FCFA. Idéale pour les artisans, commerçants individuels et prestataires de services.",
        ],
    },
    {
        id: 'doc-cooperative-ohada',
        titre: "Création d'une société coopérative - OHADA",
        fichier: 'cooperative-ohada-ci.pdf',
        version: '2024',
        categorie: 'creation-entreprise',
        organisme: 'OHADA / Ministère du Commerce',
        chunks: [
            "La société coopérative en Côte d'Ivoire est régie par l'Acte Uniforme OHADA relatif au droit des sociétés coopératives (2010). C'est un groupement de personnes volontairement réunies pour satisfaire leurs aspirations économiques, sociales et culturelles communes, au moyen d'une entreprise dont la propriété et la gestion sont collectives. Il existe deux formes : la société coopérative simplifiée (SCOOPS, minimum 5 membres) et la société coopérative avec conseil d'administration (COOP-CA, minimum 15 membres).",
            "Pour constituer une coopérative, les étapes sont : 1) Tenue de l'assemblée générale constitutive ; 2) Adoption des statuts et du règlement intérieur ; 3) Élection des organes de gestion (comité de gestion ou conseil d'administration) ; 4) Immatriculation au Registre des Sociétés Coopératives tenu par l'autorité administrative compétente. Aucun capital minimum légal n'est imposé : il est librement fixé par les statuts et constitué de parts sociales souscrites par les membres.",
            "Documents requis pour immatriculer une coopérative : procès-verbal de l'assemblée générale constitutive, statuts signés, liste des membres fondateurs avec leurs CNI, liste des dirigeants élus, déclaration sur l'honneur de non-condamnation des dirigeants, justificatif du siège social. L'immatriculation au Registre des Sociétés Coopératives confère la personnalité juridique. Les frais sont modérés, généralement inférieurs à ceux d'une SARL.",
            "La coopérative est particulièrement adaptée aux secteurs agricoles (café, cacao, hévéa, anacarde), à l'artisanat et aux activités d'épargne et de crédit. Chaque membre dispose d'une voix en assemblée générale, quel que soit le nombre de parts détenues (principe « un homme, une voix »). Les excédents sont répartis sous forme de ristournes au prorata des opérations effectuées par chaque membre avec la coopérative.",
        ],
    },
    {
        id: 'doc-obligations-post-creation',
        titre: "Obligations après la création d'entreprise (RCCM, DGI, CNPS)",
        fichier: 'obligations-post-creation-ci.pdf',
        version: '2024',
        categorie: 'creation-entreprise',
        organisme: 'CEPICI / DGI / CNPS',
        chunks: [
            "Après la création de l'entreprise au CEPICI, l'entrepreneur reçoit trois identifiants essentiels délivrés simultanément par le guichet unique : l'extrait RCCM (Registre du Commerce et du Crédit Mobilier) délivré par le tribunal, le Numéro de Compte Contribuable (NCC) délivré par la Direction Générale des Impôts, et le numéro d'employeur CNPS pour la sécurité sociale. Ces trois numéros doivent figurer sur toutes les factures et documents officiels de l'entreprise.",
            "Obligations fiscales auprès de la DGI : l'entreprise doit souscrire une Déclaration Fiscale d'Existence (DFE) dans les 30 jours suivant le début d'activité. Elle est ensuite assujettie à la patente (contribution des patentes), à la TVA si son chiffre d'affaires dépasse le seuil légal, à l'impôt sur les bénéfices (BIC ou IS), et à la déclaration annuelle des états financiers selon le référentiel SYSCOHADA. Les petites entreprises peuvent relever de l'impôt synthétique.",
            "Obligations sociales auprès de la CNPS (Caisse Nationale de Prévoyance Sociale) : dès l'embauche d'un premier salarié, l'employeur doit s'immatriculer comme employeur, déclarer ses salariés, et verser mensuellement les cotisations sociales (retraite, accidents du travail, prestations familiales). La déclaration et le paiement se font en ligne via la plateforme e-CNPS. Le défaut de déclaration expose à des pénalités.",
            "Autres formalités courantes : ouverture d'un compte bancaire professionnel, adhésion à une caisse de retraite complémentaire le cas échéant, obtention des autorisations sectorielles spécifiques (agrément, licence) selon l'activité, et tenue d'une comptabilité régulière. Pour les activités réglementées (transport, restauration, BTP, santé), des agréments supplémentaires auprès des ministères de tutelle sont obligatoires avant le démarrage.",
        ],
    },
    {
        id: 'doc-cni-passeport',
        titre: "Carte nationale d'identité et passeport en Côte d'Ivoire",
        fichier: 'cni-passeport-ci.pdf',
        version: '2024',
        categorie: 'etat-civil',
        organisme: 'ONECI / DST',
        chunks: [
            "La Carte Nationale d'Identité (CNI) ivoirienne est délivrée par l'Office National de l'État Civil et de l'Identification (ONECI). L'enrôlement biométrique se fait dans un centre ONECI. Documents requis : extrait d'acte de naissance ou jugement supplétif, certificat de nationalité ivoirienne, ancienne CNI en cas de renouvellement. Le coût est d'environ 5 000 FCFA et le délai de délivrance varie de 2 à 4 semaines. La CNI est valable 10 ans.",
            "Le passeport ivoirien est délivré par la Direction de la Surveillance du Territoire (DST) / Direction Générale de la Police Nationale. La demande se fait en ligne sur la plateforme dédiée puis par un rendez-vous d'enrôlement biométrique. Documents requis : CNI valide, extrait d'acte de naissance, certificat de nationalité, 2 photos d'identité aux normes, et le reçu de paiement des frais. Le passeport ordinaire coûte environ 40 000 FCFA (validité 5 ans).",
            "En cas de perte ou de vol de la CNI ou du passeport, il faut d'abord obtenir une déclaration de perte auprès d'un commissariat de police ou d'une brigade de gendarmerie. Cette déclaration, accompagnée des pièces justificatives habituelles, permet d'engager la procédure de duplicata. Les délais et coûts du duplicata sont comparables à ceux d'une première demande.",
            "L'extrait d'acte de naissance est la pièce de base de toutes les démarches d'identité. Il s'obtient à la mairie ou au centre d'état civil du lieu de naissance, ou en ligne dans les communes connectées au système d'état civil numérisé. Pour les personnes non déclarées à la naissance, un jugement supplétif d'acte de naissance rendu par le tribunal tient lieu d'acte de naissance.",
        ],
    },
    {
        id: 'doc-nationalite-ci',
        titre: "Nationalité ivoirienne : certificat, attribution et naturalisation",
        fichier: 'nationalite-ci.pdf',
        version: '2024',
        categorie: 'etat-civil',
        organisme: 'Ministère de la Justice',
        chunks: [
            "La nationalité ivoirienne est régie par la Loi n°61-415 du 14 décembre 1961 portant Code de la nationalité, modifiée notamment par les lois de 1972 et de 2013. Elle s'acquiert principalement par filiation (droit du sang) : est ivoirien l'enfant né d'un père ou d'une mère ivoirien(ne). La nationalité peut aussi résulter de l'acquisition (mariage, naturalisation, déclaration) selon les conditions fixées par la loi.",
            "Le certificat de nationalité ivoirienne est délivré par le président du tribunal de première instance ou le juge de section détaché. Documents requis : extrait d'acte de naissance de l'intéressé, extrait d'acte de naissance du parent ivoirien, certificat de nationalité ou CNI du parent ivoirien, et un timbre fiscal. Le délai est généralement de 15 à 30 jours et le coût reste modéré (timbres et frais de greffe).",
            "La naturalisation permet à un étranger d'acquérir la nationalité ivoirienne par décret. Conditions principales : résidence habituelle en Côte d'Ivoire pendant au moins 5 ans, majorité, bonne moralité (casier judiciaire vierge), assimilation à la communauté ivoirienne et moyens d'existence suffisants. La demande est adressée au ministère de la Justice ; elle est instruite puis accordée par décret après enquête.",
            "L'acquisition de la nationalité par le mariage n'est pas automatique : le conjoint étranger d'un(e) Ivoirien(ne) peut souscrire une déclaration d'acquisition sous certaines conditions de durée de mariage et de communauté de vie. Le gouvernement dispose d'un droit d'opposition. Il est recommandé de se renseigner auprès du tribunal compétent pour connaître les pièces et délais en vigueur.",
        ],
    },
    {
        id: 'doc-jugement-suppletif',
        titre: "Jugement supplétif et rectification d'actes d'état civil",
        fichier: 'jugement-suppletif-ci.pdf',
        version: '2024',
        categorie: 'etat-civil',
        organisme: 'Tribunal de première instance',
        chunks: [
            "Le jugement supplétif d'acte de naissance est une décision de justice qui remplace l'acte de naissance lorsqu'une naissance n'a pas été déclarée dans le délai légal de 3 mois, ou lorsque le registre d'état civil a été perdu ou détruit. La requête est déposée auprès du tribunal de première instance ou de la section détachée du lieu de naissance, souvent avec l'assistance d'un avocat ou directement au greffe.",
            "Pièces généralement demandées pour un jugement supplétif : une attestation de non-inscription délivrée par le centre d'état civil, un certificat de naissance ou une attestation médicale, le témoignage de deux personnes majeures, et les pièces d'identité des parents. Le tribunal peut entendre les témoins avant de rendre sa décision. Une fois le jugement rendu, il est transcrit sur les registres d'état civil pour produire un extrait d'acte de naissance.",
            "La rectification d'un acte d'état civil (erreur sur les noms, prénoms, dates ou lieux) se fait par requête en rectification adressée au président du tribunal. Les erreurs purement matérielles peuvent parfois être corrigées par l'officier d'état civil sur instruction du procureur de la République. Il est essentiel de corriger ces erreurs car elles bloquent souvent l'obtention de la CNI, du passeport ou l'inscription scolaire.",
            "La reconstitution d'actes concerne les registres d'état civil détruits (incendie, conflit, intempéries). Une procédure judiciaire collective ou individuelle permet de reconstituer les actes perdus. Les usagers concernés doivent rassembler tout commencement de preuve (anciens documents, copies, témoignages) et se rapprocher du tribunal et de la mairie concernée pour engager la démarche.",
        ],
    },
];
async function main() {
    if (!VOYAGE_API_KEY) {
        throw new Error('VOYAGE_API_KEY manquante dans .env — embeddings impossibles.');
    }
    const flat = [];
    for (const doc of CORPUS) {
        doc.chunks.forEach((texte, i) => flat.push({ docId: doc.id, ordre: i + 1, page: i + 1, texte }));
    }
    console.log(`🧠 Génération des embeddings Voyage (${flat.length} chunks, modèle ${VOYAGE_MODEL})…`);
    const vectors = [];
    for (let i = 0; i < flat.length; i += BATCH) {
        const slice = flat.slice(i, i + BATCH);
        const embs = await embedBatch(slice.map((c) => c.texte));
        vectors.push(...embs);
        console.log(`   → ${Math.min(i + BATCH, flat.length)}/${flat.length}`);
    }
    for (const doc of CORPUS) {
        await prisma.knowledgeDocument.upsert({
            where: { id: doc.id },
            update: {
                titre: doc.titre,
                fichier: doc.fichier,
                version: doc.version,
                categorie: doc.categorie,
                organisme: doc.organisme,
                actif: true,
            },
            create: {
                id: doc.id,
                titre: doc.titre,
                fichier: doc.fichier,
                version: doc.version,
                categorie: doc.categorie,
                organisme: doc.organisme,
                actif: true,
            },
        });
        await prisma.knowledgeChunk.deleteMany({ where: { documentId: doc.id } });
    }
    for (let i = 0; i < flat.length; i++) {
        const c = flat[i];
        const vectorStr = `[${vectors[i].join(',')}]`;
        await prisma.$executeRaw `
      INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, page, ordre)
      VALUES (gen_random_uuid(), ${c.docId}, ${c.texte}, ${vectorStr}::vector(1024), ${c.page}, ${c.ordre})
    `;
    }
    const docCount = CORPUS.length;
    console.log('✅ Corpus de connaissances enrichi et ré-indexé.');
    console.log(`   → ${docCount} documents, ${flat.length} chunks avec embeddings réels (1024-dim)`);
}
main()
    .catch((e) => {
    console.error('❌ Échec enrichissement corpus:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-knowledge.js.map