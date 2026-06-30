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
    distanceKm?: number;
}
export interface FindServiceOptions {
    domaine?: string;
    type?: string;
    lat?: number;
    lng?: number;
    limit?: number;
}
export declare function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number;
export declare class ServiceDirectoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    find(opts?: FindServiceOptions): Promise<ServicePointView[]>;
}
