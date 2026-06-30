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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const llm_port_1 = require("../../core/ports/llm.port");
const pdf_text_extractor_1 = require("../../infrastructure/pdf/pdf-text-extractor");
let DocumentsService = class DocumentsService {
    prisma;
    llm;
    pdf;
    constructor(prisma, llm, pdf) {
        this.prisma = prisma;
        this.llm = llm;
        this.pdf = pdf;
    }
    findAll(userId) {
        return this.prisma.userDocument.findMany({
            where: { userId },
            include: { analysis: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id, userId) {
        return this.prisma.userDocument.findFirst({
            where: { id, userId },
            include: { analysis: true },
        });
    }
    async upload(userId, file, nom) {
        const doc = await this.prisma.userDocument.create({
            data: {
                userId,
                nom: nom || file.originalname,
                type: file.mimetype,
                chemin: file.path,
                taille: file.size,
            },
        });
        try {
            const text = await this.pdf.extractText(file.path);
            const resume = await this.summarize(text);
            await this.prisma.documentAnalysis.create({
                data: {
                    documentId: doc.id,
                    texteOcr: text.slice(0, 10000),
                    resume,
                    lisible: true,
                },
            });
        }
        catch {
            await this.prisma.documentAnalysis.create({
                data: { documentId: doc.id, lisible: false },
            });
        }
        return this.prisma.userDocument.findUnique({
            where: { id: doc.id },
            include: { analysis: true },
        });
    }
    async remove(id, userId) {
        await this.prisma.userDocument.findFirstOrThrow({ where: { id, userId } });
        return this.prisma.userDocument.delete({ where: { id } });
    }
    async summarize(text) {
        try {
            const { text: resume } = await this.llm.complete({
                tier: 'generation',
                maxTokens: 256,
                messages: [
                    {
                        role: 'user',
                        content: `Résume ce document administratif en 3-5 phrases en français :\n\n${text.slice(0, 3000)}`,
                    },
                ],
            });
            return resume;
        }
        catch {
            return 'Résumé non disponible.';
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(llm_port_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, pdf_text_extractor_1.PdfTextExtractor])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map