import { DocumentTemplate } from './document-template.types';

/**
 * Registre des modèles de documents officiels.
 * Champs `source: user|folder` => remplis automatiquement par le service ;
 * `source: ask` => saisis par l'utilisateur avant génération.
 */
export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    key: 'demande-acte-naissance',
    titre: "Demande de copie d'acte de naissance",
    description:
      "Demande manuscrite type adressée à l'officier de l'état civil pour obtenir une ou plusieurs copies de votre acte de naissance.",
    domaines: ['etat_civil'],
    destinataire: "Monsieur/Madame l'Officier de l'état civil",
    objet: "Demande de copie d'acte de naissance",
    fields: [
      { key: 'nomComplet', label: 'Nom complet', required: true, source: 'user' },
      { key: 'telephone', label: 'Téléphone', required: false, source: 'user' },
      {
        key: 'dateNaissance',
        label: 'Date de naissance',
        required: true,
        source: 'ask',
        example: '12/05/1998',
      },
      {
        key: 'lieuNaissance',
        label: 'Lieu de naissance',
        required: true,
        source: 'ask',
        example: 'Abidjan, Cocody',
      },
      {
        key: 'nombreCopies',
        label: 'Nombre de copies souhaitées',
        required: true,
        source: 'ask',
        example: '2',
      },
    ],
    staticBody: [
      'Madame, Monsieur,',
      '',
      "Je soussigné(e) {{nomComplet}}, né(e) le {{dateNaissance}} à {{lieuNaissance}}, ai l'honneur de solliciter la délivrance de {{nombreCopies}} copie(s) intégrale(s) de mon acte de naissance.",
      '',
      'Vous trouverez ci-joint les pièces nécessaires au traitement de ma demande.',
      '',
      "Dans l'attente d'une suite favorable, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
    ].join('\n'),
  },
  {
    key: 'declaration-cepici-entreprise',
    titre: "Demande d'immatriculation d'entreprise (Guichet Unique CEPICI)",
    description:
      "Lettre de demande d'immatriculation adressée au Guichet Unique du CEPICI pour la création de votre entreprise.",
    domaines: ['creation_entreprise'],
    destinataire: 'Monsieur le Directeur du Guichet Unique (CEPICI)',
    objet: "Demande d'immatriculation — {{denominationSociale}}",
    fields: [
      { key: 'nomComplet', label: 'Nom complet du promoteur', required: true, source: 'user' },
      { key: 'telephone', label: 'Téléphone', required: false, source: 'user' },
      {
        key: 'denominationSociale',
        label: "Dénomination de l'entreprise",
        required: true,
        source: 'ask',
        example: 'CIVISOFT',
      },
      {
        key: 'formeJuridique',
        label: 'Forme juridique',
        required: true,
        source: 'ask',
        example: 'SARL',
      },
      {
        key: 'activite',
        label: 'Activité principale',
        required: true,
        source: 'ask',
        example: 'Développement de logiciels',
      },
      {
        key: 'capital',
        label: 'Capital social',
        required: true,
        source: 'ask',
        example: '1 000 000 FCFA',
      },
      {
        key: 'adresseSiege',
        label: 'Adresse du siège social',
        required: true,
        source: 'ask',
        example: 'Abidjan, Plateau',
      },
    ],
    staticBody: [
      'Madame, Monsieur,',
      '',
      "Je soussigné(e) {{nomComplet}}, ai l'honneur de solliciter l'immatriculation de l'entreprise dénommée « {{denominationSociale}} », constituée sous la forme juridique {{formeJuridique}}.",
      '',
      '- Activité principale : {{activite}}',
      '- Capital social : {{capital}}',
      '- Siège social : {{adresseSiege}}',
      '',
      "Je joins à la présente l'ensemble des pièces requises pour la constitution du dossier auprès du Guichet Unique.",
      '',
      "Je vous prie d'agréer, Madame, Monsieur, l'expression de ma considération distinguée.",
    ].join('\n'),
  },
  {
    key: 'lettre-requisition',
    titre: 'Lettre de demande administrative',
    description:
      "Lettre formelle générique pour solliciter un document ou une démarche auprès d'une administration. Le corps est rédigé automatiquement selon votre objet.",
    domaines: ['etat_civil', 'creation_entreprise'],
    destinataire: "À l'autorité administrative compétente",
    objet: 'Demande administrative — {{objetDemande}}',
    fields: [
      { key: 'nomComplet', label: 'Nom complet', required: true, source: 'user' },
      { key: 'telephone', label: 'Téléphone', required: false, source: 'user' },
      {
        key: 'objetDemande',
        label: 'Objet de votre demande',
        required: true,
        source: 'ask',
        example: "obtention d'un certificat de résidence",
      },
      {
        key: 'precisions',
        label: 'Précisions (facultatif)',
        required: false,
        source: 'ask',
        example: 'résidant à Yopougon depuis 2019',
      },
    ],
    bodyInstruction: [
      "Rédige UNIQUEMENT le corps d'une lettre administrative formelle et polie, en français,",
      "adressée à une administration ivoirienne, par laquelle le demandeur sollicite : {{objetDemande}}.",
      'Précisions fournies par le demandeur : {{precisions}}.',
      'Contraintes : 3 paragraphes maximum, ton respectueux ; NE PAS inclure de formule',
      "d'en-tête, de date, ni de salutation finale (elles sont ajoutées automatiquement) ;",
      "n'invente aucune information qui n'a pas été fournie.",
    ].join(' '),
  },
];

/** Retourne un template par sa clé, ou undefined. */
export function getTemplate(key: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.key === key);
}

/**
 * Templates applicables à un domaine (et, si fourni, à une procédure précise).
 * Un template sans `procedureSlugs` s'applique à tout le domaine.
 */
export function templatesForDomaine(
  domaine: string,
  procedureSlug?: string | null,
): DocumentTemplate[] {
  return DOCUMENT_TEMPLATES.filter((t) => {
    if (!t.domaines.includes(domaine)) return false;
    if (!t.procedureSlugs || t.procedureSlugs.length === 0) return true;
    return procedureSlug ? t.procedureSlugs.includes(procedureSlug) : true;
  });
}
