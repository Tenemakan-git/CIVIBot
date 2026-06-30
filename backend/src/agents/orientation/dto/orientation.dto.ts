/** Point de service compétent suggéré dans le pipeline. */
export interface OrientationServicePoint {
  id: string;
  type: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string | null;
  horaires: string | null;
  url: string | null;
  /** Distance à vol d'oiseau (km) si une position a été fournie. */
  distanceKm?: number | null;
}

/** Sortie de l'Orientation Agent : où déposer le dossier. */
export interface OrientationDto {
  servicePoints: OrientationServicePoint[];
}
