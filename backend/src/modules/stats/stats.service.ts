import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UsageDailyPoint {
  date: string; // YYYY-MM-DD
  calls: number;
  cost: number;
  tokens: number;
}
export interface UsageByModel {
  modele: string;
  calls: number;
  cost: number;
  tokensInput: number;
  tokensOutput: number;
}
export interface UsageReport {
  window: {
    days: number;
    calls: number;
    cost: number;
    tokensInput: number;
    tokensOutput: number;
    avgDurationMs: number;
  };
  allTime: {
    calls: number;
    cost: number;
    tokensInput: number;
    tokensOutput: number;
  };
  daily: UsageDailyPoint[];
  byModel: UsageByModel[];
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /** Compteurs globaux pour les cartes KPI du dashboard. */
  async getStats() {
    const [users, conversations, documents, aiLogs, folders] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.conversation.count(),
        this.prisma.knowledgeDocument.count(),
        this.prisma.aiLog.count(),
        this.prisma.administrativeFolder.count(),
      ]);
    return { users, conversations, documents, aiLogs, folders };
  }

  /**
   * Coûts & usage IA sur une fenêtre glissante : série par jour (remplie),
   * répartition par modèle, totaux fenêtre + all-time. Agrégation en mémoire
   * (volume admin) — évite la troncature de date SQL non portable.
   */
  async getUsage(days = 14): Promise<UsageReport> {
    const span = Math.min(Math.max(days, 1), 90);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (span - 1));

    const [logs, allTime] = await Promise.all([
      this.prisma.aiLog.findMany({
        where: { createdAt: { gte: since } },
        select: {
          modele: true,
          tokensInput: true,
          tokensOutput: true,
          cout: true,
          dureeMs: true,
          createdAt: true,
        },
      }),
      this.prisma.aiLog.aggregate({
        _sum: { cout: true, tokensInput: true, tokensOutput: true },
        _count: true,
      }),
    ]);

    const dayKey = (d: Date) => d.toISOString().slice(0, 10);

    // Pré-remplit chaque jour de la fenêtre (zéros) pour une série continue.
    const dailyMap = new Map<string, UsageDailyPoint>();
    for (let i = 0; i < span; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const k = dayKey(d);
      dailyMap.set(k, { date: k, calls: 0, cost: 0, tokens: 0 });
    }

    const modelMap = new Map<string, UsageByModel>();
    let cost = 0;
    let tin = 0;
    let tout = 0;
    let dur = 0;

    for (const l of logs) {
      const c = l.cout ?? 0;
      const bucket = dailyMap.get(dayKey(l.createdAt));
      if (bucket) {
        bucket.calls += 1;
        bucket.cost += c;
        bucket.tokens += l.tokensInput + l.tokensOutput;
      }
      const m =
        modelMap.get(l.modele) ?? {
          modele: l.modele,
          calls: 0,
          cost: 0,
          tokensInput: 0,
          tokensOutput: 0,
        };
      m.calls += 1;
      m.cost += c;
      m.tokensInput += l.tokensInput;
      m.tokensOutput += l.tokensOutput;
      modelMap.set(l.modele, m);

      cost += c;
      tin += l.tokensInput;
      tout += l.tokensOutput;
      dur += l.dureeMs;
    }

    const round = (n: number) => Math.round(n * 1e6) / 1e6;

    return {
      window: {
        days: span,
        calls: logs.length,
        cost: round(cost),
        tokensInput: tin,
        tokensOutput: tout,
        avgDurationMs: logs.length ? Math.round(dur / logs.length) : 0,
      },
      allTime: {
        calls: allTime._count,
        cost: round(allTime._sum.cout ?? 0),
        tokensInput: allTime._sum.tokensInput ?? 0,
        tokensOutput: allTime._sum.tokensOutput ?? 0,
      },
      daily: [...dailyMap.values()].map((d) => ({ ...d, cost: round(d.cost) })),
      byModel: [...modelMap.values()]
        .map((m) => ({ ...m, cost: round(m.cost) }))
        .sort((a, b) => b.cost - a.cost),
    };
  }
}
