/** Métadonnées d'affichage partagées pour les dossiers (statuts, domaines, notifications). */

export const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  ouvert: { label: 'Ouvert', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  en_cours: { label: 'En cours', cls: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  complet: { label: 'Complet', cls: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  termine: { label: 'Terminé', cls: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
};

export function statusMeta(statut: string) {
  return STATUS_META[statut] ?? { label: statut, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
}

const ETAT_CIVIL = { label: 'État civil', cls: 'bg-emerald-50 text-emerald-700' };
const CREATION_ENTREPRISE = {
  label: 'Création d\'entreprise',
  cls: 'bg-indigo-50 text-indigo-700',
};

// L'API renvoie le domaine sous la forme de l'enum `Domain` (underscore :
// `etat_civil`) ; on garde aussi les variantes à tiret par sécurité.
export const DOMAIN_META: Record<string, { label: string; cls: string }> = {
  etat_civil: ETAT_CIVIL,
  'etat-civil': ETAT_CIVIL,
  creation_entreprise: CREATION_ENTREPRISE,
  'creation-entreprise': CREATION_ENTREPRISE,
};

export function domainMeta(domaine: string) {
  return DOMAIN_META[domaine] ?? { label: domaine, cls: 'bg-gray-50 text-gray-600' };
}

/** type de notification → libellé + couleur (in-app uniquement). */
export const NOTIF_META: Record<string, { label: string; cls: string }> = {
  rappel: { label: 'Rappel', cls: 'text-orange-600 bg-orange-50' },
  retard: { label: 'Retard', cls: 'text-red-600 bg-red-50' },
  termine: { label: 'Terminé', cls: 'text-green-600 bg-green-50' },
  nouvelle_info: { label: 'Nouvelle info', cls: 'text-amber-600 bg-amber-50' },
};

export function notifMeta(type: string) {
  return NOTIF_META[type] ?? { label: type, cls: 'text-gray-600 bg-gray-50' };
}

/** statut d'un document requis → libellé + style. */
export const DOC_STATUS_META: Record<string, { label: string; cls: string }> = {
  fourni: { label: 'Fourni', cls: 'bg-green-50 text-green-700 border-green-200' },
  manquant: { label: 'Manquant', cls: 'bg-red-50 text-red-600 border-red-200' },
  a_verifier: { label: 'À vérifier', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export function docStatusMeta(statut: string) {
  return DOC_STATUS_META[statut] ?? { label: statut, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
}

/** Formate une date ISO en « il y a … » court (français). */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return 'à l\'instant';
  const min = Math.round(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j < 30) return `il y a ${j} j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}
