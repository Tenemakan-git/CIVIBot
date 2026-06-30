import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Annuaire indicatif des services administratifs (Côte d'Ivoire).
 * Coordonnées approximatives à vocation de démonstration — à fiabiliser avant
 * usage réel (les horaires/adresses doivent être vérifiés auprès des services).
 */
type Seed = {
  type: string;
  nom: string;
  domaine: string;
  adresse: string;
  commune?: string;
  ville: string;
  region?: string;
  latitude: number;
  longitude: number;
  telephone?: string;
  horaires?: string;
  services: string[];
  url?: string;
};

const ETAT_CIVIL = ['Acte de naissance', 'Acte de mariage', 'Certificat de résidence'];
const ENTREPRISE = ['Immatriculation', "Déclaration d'entreprise", 'Registre du commerce (RCCM)'];
const HORAIRES = 'Lun–Ven 7h30–16h30';
const SRC = 'Données indicatives CiviBot';

// Mairies des communes du Grand Abidjan (état civil).
const mairie = (
  nom: string,
  commune: string,
  latitude: number,
  longitude: number,
): Seed => ({
  type: 'mairie',
  nom,
  domaine: 'etat_civil',
  adresse: `Mairie de ${commune}`,
  commune,
  ville: 'Abidjan',
  region: 'Abidjan',
  latitude,
  longitude,
  horaires: HORAIRES,
  services: ETAT_CIVIL,
  url: 'https://www.interieur.gouv.ci',
});

const POINTS: Seed[] = [
  mairie('Mairie du Plateau', 'Plateau', 5.3247, -4.0186),
  mairie('Mairie de Cocody', 'Cocody', 5.349, -3.987),
  mairie('Mairie de Yopougon', 'Yopougon', 5.337, -4.082),
  mairie('Mairie d’Abobo', 'Abobo', 5.418, -4.019),
  mairie('Mairie d’Adjamé', 'Adjamé', 5.364, -4.025),
  mairie('Mairie de Treichville', 'Treichville', 5.294, -4.008),
  mairie('Mairie de Marcory', 'Marcory', 5.301, -3.987),
  mairie('Mairie de Koumassi', 'Koumassi', 5.29, -3.954),
  mairie('Mairie de Port-Bouët', 'Port-Bouët', 5.256, -3.926),
  mairie('Mairie d’Attécoubé', 'Attécoubé', 5.338, -4.036),
  mairie('Mairie de Bingerville', 'Bingerville', 5.355, -3.886),
  mairie('Mairie d’Anyama', 'Anyama', 5.494, -4.052),

  // Mairies hors Abidjan (état civil)
  {
    type: 'mairie',
    nom: 'Mairie de Yamoussoukro',
    domaine: 'etat_civil',
    adresse: 'Mairie de Yamoussoukro',
    ville: 'Yamoussoukro',
    region: 'Lacs',
    latitude: 6.8276,
    longitude: -5.2893,
    horaires: HORAIRES,
    services: ETAT_CIVIL,
  },
  {
    type: 'mairie',
    nom: 'Mairie de Bouaké',
    domaine: 'etat_civil',
    adresse: 'Mairie de Bouaké',
    ville: 'Bouaké',
    region: 'Gbêkê',
    latitude: 7.69,
    longitude: -5.03,
    horaires: HORAIRES,
    services: ETAT_CIVIL,
  },
  {
    type: 'mairie',
    nom: 'Mairie de San-Pédro',
    domaine: 'etat_civil',
    adresse: 'Mairie de San-Pédro',
    ville: 'San-Pédro',
    region: 'San-Pédro',
    latitude: 4.7485,
    longitude: -6.6363,
    horaires: HORAIRES,
    services: ETAT_CIVIL,
  },
  {
    type: 'mairie',
    nom: 'Mairie de Korhogo',
    domaine: 'etat_civil',
    adresse: 'Mairie de Korhogo',
    ville: 'Korhogo',
    region: 'Poro',
    latitude: 9.458,
    longitude: -5.629,
    horaires: HORAIRES,
    services: ETAT_CIVIL,
  },
  {
    type: 'mairie',
    nom: 'Mairie de Daloa',
    domaine: 'etat_civil',
    adresse: 'Mairie de Daloa',
    ville: 'Daloa',
    region: 'Haut-Sassandra',
    latitude: 6.877,
    longitude: -6.45,
    horaires: HORAIRES,
    services: ETAT_CIVIL,
  },

  // Tribunaux (jugements supplétifs d'état civil + RCCM)
  {
    type: 'tribunal',
    nom: 'Tribunal de Première Instance d’Abidjan-Plateau',
    domaine: 'both',
    adresse: 'Boulevard de la République, Plateau',
    commune: 'Plateau',
    ville: 'Abidjan',
    region: 'Abidjan',
    latitude: 5.323,
    longitude: -4.021,
    horaires: HORAIRES,
    services: ['Jugement supplétif', 'Registre du commerce (RCCM)', 'Casier judiciaire'],
    url: 'https://www.justice.gouv.ci',
  },
  {
    type: 'tribunal',
    nom: 'Tribunal de Première Instance de Bouaké',
    domaine: 'both',
    adresse: 'Centre-ville, Bouaké',
    ville: 'Bouaké',
    region: 'Gbêkê',
    latitude: 7.6885,
    longitude: -5.0315,
    horaires: HORAIRES,
    services: ['Jugement supplétif', 'Registre du commerce (RCCM)'],
  },

  // Création d'entreprise — CEPICI / Guichet Unique
  {
    type: 'cepici',
    nom: 'CEPICI — Guichet Unique (Plateau)',
    domaine: 'creation_entreprise',
    adresse: 'Immeuble CCIA, Avenue Jean-Paul II, Plateau',
    commune: 'Plateau',
    ville: 'Abidjan',
    region: 'Abidjan',
    latitude: 5.321,
    longitude: -4.022,
    telephone: '+225 27 20 30 36 00',
    horaires: HORAIRES,
    services: ENTREPRISE,
    url: 'https://www.cepici.gouv.ci',
  },
  {
    type: 'guichet_unique',
    nom: 'CEPICI — Antenne de Yamoussoukro',
    domaine: 'creation_entreprise',
    adresse: 'Centre administratif, Yamoussoukro',
    ville: 'Yamoussoukro',
    region: 'Lacs',
    latitude: 6.809,
    longitude: -5.276,
    horaires: HORAIRES,
    services: ENTREPRISE,
    url: 'https://www.cepici.gouv.ci',
  },
  {
    type: 'guichet_unique',
    nom: 'CEPICI — Antenne de Bouaké',
    domaine: 'creation_entreprise',
    adresse: 'Centre-ville, Bouaké',
    ville: 'Bouaké',
    region: 'Gbêkê',
    latitude: 7.6905,
    longitude: -5.0285,
    horaires: HORAIRES,
    services: ENTREPRISE,
    url: 'https://www.cepici.gouv.ci',
  },
  {
    type: 'guichet_unique',
    nom: 'CEPICI — Antenne de San-Pédro',
    domaine: 'creation_entreprise',
    adresse: 'Zone portuaire, San-Pédro',
    ville: 'San-Pédro',
    region: 'San-Pédro',
    latitude: 4.7495,
    longitude: -6.634,
    horaires: HORAIRES,
    services: ENTREPRISE,
    url: 'https://www.cepici.gouv.ci',
  },

  // Préfectures (orientation générale, deux domaines)
  {
    type: 'prefecture',
    nom: 'Préfecture d’Abidjan',
    domaine: 'both',
    adresse: 'Plateau, Abidjan',
    commune: 'Plateau',
    ville: 'Abidjan',
    region: 'Abidjan',
    latitude: 5.3258,
    longitude: -4.0205,
    horaires: HORAIRES,
    services: ['Légalisation', 'Certificat de nationalité', 'Orientation administrative'],
  },
  {
    type: 'prefecture',
    nom: 'Préfecture de Yamoussoukro',
    domaine: 'both',
    adresse: 'Yamoussoukro',
    ville: 'Yamoussoukro',
    region: 'Lacs',
    latitude: 6.8205,
    longitude: -5.2767,
    horaires: HORAIRES,
    services: ['Légalisation', 'Orientation administrative'],
  },
];

async function main() {
  await prisma.servicePoint.deleteMany();
  await prisma.servicePoint.createMany({
    data: POINTS.map((p) => ({ ...p, source: SRC })),
  });
  const count = await prisma.servicePoint.count();
  console.log(`✅ Annuaire services seedé : ${count} points.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
