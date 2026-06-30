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
exports.KnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pdf_text_extractor_1 = require("../../infrastructure/pdf/pdf-text-extractor");
const embedding_port_1 = require("../../core/ports/embedding.port");
let KnowledgeService = class KnowledgeService {
    prisma;
    pdf;
    embedding;
    constructor(prisma, pdf, embedding) {
        this.prisma = prisma;
        this.pdf = pdf;
        this.embedding = embedding;
    }
    findAll() {
        return this.prisma.knowledgeDocument.findMany({
            include: { _count: { select: { chunks: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.knowledgeDocument.findUnique({
            where: { id },
            include: { chunks: { select: { id: true, texte: true, ordre: true, page: true } } },
        });
    }
    async import(filePath, titre, categorie, organisme) {
        const doc = await this.prisma.knowledgeDocument.create({
            data: { titre, fichier: filePath, categorie, organisme },
        });
        const chunks = await this.pdf.processDocument(filePath);
        const embeddings = await this.embedding.embedBatch(chunks);
        for (let i = 0; i < chunks.length; i++) {
            const vectorStr = `[${embeddings[i].join(',')}]`;
            await this.prisma.$executeRaw `
        INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, ordre)
        VALUES (gen_random_uuid(), ${doc.id}, ${chunks[i]}, ${vectorStr}::vector, ${i})
      `;
        }
        return { documentId: doc.id, chunksCount: chunks.length };
    }
    async reindex(id) {
        const doc = await this.prisma.knowledgeDocument.findUniqueOrThrow({ where: { id } });
        await this.prisma.knowledgeChunk.deleteMany({ where: { documentId: id } });
        const chunks = await this.pdf.processDocument(doc.fichier);
        const embeddings = await this.embedding.embedBatch(chunks);
        for (let i = 0; i < chunks.length; i++) {
            const vectorStr = `[${embeddings[i].join(',')}]`;
            await this.prisma.$executeRaw `
        INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, ordre)
        VALUES (gen_random_uuid(), ${id}, ${chunks[i]}, ${vectorStr}::vector, ${i})
      `;
        }
        return { chunksCount: chunks.length };
    }
    async remove(id) {
        return this.prisma.knowledgeDocument.delete({ where: { id } });
    }
};
exports.KnowledgeService = KnowledgeService;
exports.KnowledgeService = KnowledgeService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(embedding_port_1.EMBEDDING_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_text_extractor_1.PdfTextExtractor, Object])
], KnowledgeService);
//# sourceMappingURL=knowledge.service.js.map