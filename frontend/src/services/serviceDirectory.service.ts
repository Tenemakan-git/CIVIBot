import { api } from './api';

export interface ServicePoint {
  id: string;
  type: string;
  nom: string;
  domaine: string;
  adresse: string;
  commune: string | null;
  ville: string;
  region: string | null;
  latitude: number;
  longitude: number;
  telephone: string | null;
  email: string | null;
  horaires: string | null;
  services: string[];
  url: string | null;
  source: string | null;
  distanceKm?: number;
}

export interface FindServiceParams {
  domaine?: string;
  type?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}

export const serviceDirectoryService = {
  find: (params: FindServiceParams = {}): Promise<ServicePoint[]> =>
    api.get('/services', { params }).then((r) => r.data),
};

export const SERVICE_TYPE_META: Record<
  string,
  { label: string; color: string; emoji: string }
> = {
  mairie: { label: 'Mairie', color: '#f77f00', emoji: '🏛️' },
  tribunal: { label: 'Tribunal', color: '#7c3aed', emoji: '⚖️' },
  cepici: { label: 'CEPICI', color: '#009e60', emoji: '🏢' },
  guichet_unique: { label: 'Guichet Unique', color: '#009e60', emoji: '🏢' },
  prefecture: { label: 'Préfecture', color: '#d97706', emoji: '🏤' },
};

export function typeMeta(type: string) {
  return (
    SERVICE_TYPE_META[type] ?? { label: type, color: '#6b7280', emoji: '📍' }
  );
}
