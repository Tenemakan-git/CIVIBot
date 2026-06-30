"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [users, conversations, documents, aiLogs, folders] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.conversation.count(),
            this.prisma.knowledgeDocument.count(),
            this.prisma.aiLog.count(),
            this.prisma.administrativeFolder.count(),
        ]);
        return { users, conversations, documents, aiLogs, folders };
    }
    async getUsage(days = 14) {
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
        const dayKey = (d) => d.toISOString().slice(0, 10);
        const dailyMap = new Map();
        for (let i = 0; i < span; i++) {
            const d = new Date(since);
            d.setDate(since.getDate() + i);
            const k = dayKey(d);
            dailyMap.set(k, { date: k, calls: 0, cost: 0, tokens: 0 });
        }
        const modelMap = new Map();
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
            const m = modelMap.get(l.modele) ?? {
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
        const round = (n) => Math.round(n * 1e6) / 1e6;
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
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map