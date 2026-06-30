import {
  ServiceDirectoryService,
  haversineKm,
} from './service-directory.service';

function point(over: Partial<any> = {}): any {
  return {
    id: over.id ?? 'p',
    type: 'mairie',
    nom: over.nom ?? 'Point',
    domaine: 'etat_civil',
    adresse: 'adr',
    commune: null,
    ville: over.ville ?? 'Abidjan',
    region: null,
    latitude: over.latitude ?? 5.32,
    longitude: over.longitude ?? -4.02,
    telephone: null,
    email: null,
    horaires: null,
    services: [],
    url: null,
    source: null,
  };
}

function makeService(rows: any[]) {
  const prisma = {
    servicePoint: { findMany: jest.fn().mockResolvedValue(rows) },
  };
  return { service: new ServiceDirectoryService(prisma as any), prisma };
}

describe('haversineKm', () => {
  it('mesure une distance plausible Plateau → Yamoussoukro (~220 km)', () => {
    const d = haversineKm(5.3247, -4.0186, 6.8276, -5.2893);
    expect(d).toBeGreaterThan(200);
    expect(d).toBeLessThan(260);
  });

  it('renvoie ~0 pour deux points identiques', () => {
    expect(haversineKm(5.32, -4.02, 5.32, -4.02)).toBeCloseTo(0, 5);
  });
});

describe('ServiceDirectoryService', () => {
  const rows = [
    point({ id: 'far', nom: 'Loin', latitude: 9.45, longitude: -5.63 }), // Korhogo
    point({ id: 'near', nom: 'Près', latitude: 5.33, longitude: -4.03 }), // Abidjan
  ];

  it('trie par proximité et calcule distanceKm quand une position est fournie', async () => {
    const { service } = makeService(rows);
    const res = await service.find({ lat: 5.32, lng: -4.02 });

    expect(res[0].id).toBe('near');
    expect(res[1].id).toBe('far');
    expect(res[0].distanceKm).toBeLessThan(res[1].distanceKm!);
  });

  it('ne calcule pas de distance sans position et applique la limite', async () => {
    const { service } = makeService(rows);
    const res = await service.find({ limit: 1 });

    expect(res).toHaveLength(1);
    expect(res[0].distanceKm).toBeUndefined();
  });

  it('inclut les points « both » pour un domaine donné', async () => {
    const { service, prisma } = makeService(rows);
    await service.find({ domaine: 'etat_civil' });

    expect(prisma.servicePoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          domaine: { in: ['etat_civil', 'both'] },
        }),
      }),
    );
  });
});
