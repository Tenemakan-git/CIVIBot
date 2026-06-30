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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeSearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const embedding_port_1 = require("../../core/ports/embedding.port");
let KnowledgeSearchService = class KnowledgeSearchService {
    embedding;
    prisma;
    constructor(embedding, prisma) {
        this.embedding = embedding;
        this.prisma = prisma;
    }
    async search(query, topK = 5) {
        const vector = await this.embedding.embed(query);
        const vectorStr = `[${vector.join(',')}]`;
        const rows = await this.prisma.$queryRaw `
      SELECT kc.id, kc.texte, kd.titre as "documentTitre",
             1 - (kc.embedding <=> ${vectorStr}::vector) AS score
      FROM "KnowledgeChunk" kc
      JOIN "KnowledgeDocument" kd ON kd.id = kc."documentId"
      WHERE kd.actif = true
      ORDER BY kc.embedding <=> ${vectorStr}::vector
      LIMIT ${topK}
    `;
        return rows.map((r) => ({
            id: r.id,
            titre: r.documentTitre,
            texte: r.texte,
            extrait: r.texte.slice(0, 160) + (r.texte.length > 160 ? '…' : ''),
            score: Number(r.score),
        }));
    }
};
exports.KnowledgeSearchService = KnowledgeSearchService;
exports.KnowledgeSearchService = KnowledgeSearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(embedding_port_1.EMBEDDING_PROVIDER)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], KnowledgeSearchService);
//# sourceMappingURL=knowledge-search.service.js.map