import { StatsService } from './stats.service';

function makeService(logs: any[]) {
  const prisma = {
    aiLog: {
      findMany: jest.fn().mockResolvedValue(logs),
      aggregate: jest.fn().mockResolvedValue({
        _sum: { cout: 0.5, tokensInput: 1000, tokensOutput: 500 },
        _count: 42,
      }),
    },
  };
  return { service: new StatsService(prisma as any), prisma };
}

describe('StatsService.getUsage', () => {
  it('agrège coûts/tokens, remplit la série par jour et trie par modèle', async () => {
    const today = new Date();
    const logs = [
      {
        modele: 'claude-sonnet-4-6',
        tokensInput: 100,
        tokensOutput: 50,
        cout: 0.01,
        dureeMs: 800,
        createdAt: today,
      },
      {
        modele: 'claude-opus-4-8',
        tokensInput: 200,
        tokensOutput: 80,
        cout: 0.05,
        dureeMs: 1200,
        createdAt: today,
      },
      {
        modele: 'claude-sonnet-4-6',
        tokensInput: 100,
        tokensOutput: 50,
        cout: 0.01,
        dureeMs: 400,
        createdAt: today,
      },
    ];
    const { service } = makeService(logs);

    const report = await service.getUsage(7);

    // Fenêtre
    expect(report.window.days).toBe(7);
    expect(report.window.calls).toBe(3);
    expect(report.window.cost).toBeCloseTo(0.07, 6);
    expect(report.window.tokensInput).toBe(400);
    expect(report.window.avgDurationMs).toBe(Math.round((800 + 1200 + 400) / 3));

    // Série continue : un point par jour de la fenêtre
    expect(report.daily).toHaveLength(7);
    const todayKey = today.toISOString().slice(0, 10);
    expect(report.daily.find((d) => d.date === todayKey)?.calls).toBe(3);

    // Par modèle, trié par coût décroissant (opus avant sonnet)
    expect(report.byModel[0].modele).toBe('claude-opus-4-8');
    expect(report.byModel.find((m) => m.modele === 'claude-sonnet-4-6')?.calls).toBe(2);

    // All-time depuis l'agrégat
    expect(report.allTime.calls).toBe(42);
    expect(report.allTime.cost).toBeCloseTo(0.5, 6);
  });

  it('borne la fenêtre et gère l\'absence de logs', async () => {
    const { service } = makeService([]);
    const report = await service.getUsage(999); // borné à 90
    expect(report.window.days).toBe(90);
    expect(report.daily).toHaveLength(90);
    expect(report.window.calls).toBe(0);
    expect(report.window.avgDurationMs).toBe(0);
  });
});
