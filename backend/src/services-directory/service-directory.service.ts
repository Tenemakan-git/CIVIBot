import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ServicePointView {
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
  /** Distance à vol d'oiseau (km) si une position a été fournie. */
  distanceKm?: number;
}

export interface FindServiceOptions {
  domaine?: string;
  type?: string;
  lat?: number;
  lng?: number;
  limit?: number;
}

/** Distance à vol d'oiseau (formule de Haversine), en kilomètres. */
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Annuaire des points de service administratifs. Filtre par domaine/type et,
 * si une position est fournie, trie par proximité (Haversine en mémoire — pas
 * besoin de PostGIS au volume de l'annuaire).
 */
@Injectable()
export class ServiceDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  async find(opts: FindServiceOptions = {}): Promise<ServicePointView[]> {
    const limit = opts.limit ?? 20;
    const hasCoords =
      typeof opts.lat === 'number' &&
      typeof opts.lng === 'number' &&
      !Number.isNaN(opts.lat) &&
      !Number.isNaN(opts.lng);

    const rows = await this.prisma.servicePoint.findMany({
      where: {
        // Un point « both » est compétent pour les deux domaines.
        ...(opts.domaine
          ? { domaine: { in: [opts.domaine, 'both'] } }
          : {}),
        ...(opts.type ? { type: opts.type } : {}),
      },
      orderBy: [{ ville: 'asc' }, { nom: 'asc' }],
    });

    const views: ServicePointView[] = rows.map((r) => ({ ...r }));

    if (hasCoords) {
      for (const v of views) {
        v.distanceKm =
          Math.round(
            haversineKm(opts.lat!, opts.lng!, v.latitude, v.longitude) * 10,
          ) / 10;
      }
      views.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    return views.slice(0, limit);
  }
}
