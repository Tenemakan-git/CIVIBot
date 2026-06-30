export interface OrientationServicePoint {
    id: string;
    type: string;
    nom: string;
    adresse: string;
    ville: string;
    telephone: string | null;
    horaires: string | null;
    url: string | null;
    distanceKm?: number | null;
}
export interface OrientationDto {
    servicePoints: OrientationServicePoint[];
}
