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
exports.KnowledgeManagerAgent = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const event_emitter_1 = require("@nestjs/event-emitter");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const event_names_1 = require("../../core/events/event-names");
const embedding_port_1 = require("../../core/ports/embedding.port");
const prisma_service_1 = require("../../prisma/prisma.service");
const pdf_text_extractor_1 = require("../../infrastructure/pdf/pdf-text-extractor");
let KnowledgeManagerAgent = class KnowledgeManagerAgent extends base_agent_abstract_1.BaseAgent {
    prisma;
    embedding;
    splitter;
    events;
    name = agent_name_enum_1.AgentName.KnowledgeManager;
    constructor(prisma, embedding, splitter, events) {
        super();
        this.prisma = prisma;
        this.embedding = embedding;
        this.splitter = splitter;
        this.events = events;
    }
    async run(ctx) {
        const validation = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.KnowledgeValidation);
        const ids = validation?.data?.acceptedIds ?? [];
        const documents = [];
        let totalChunks = 0;
        for (const id of ids) {
            const candidate = await this.prisma.knowledgeCandidate.findUnique({
                where: { id },
            });
            if (!candidate || candidate.statut === 'insere')
                continue;
            const committed = await this.commit(candidate);
            if (committed) {
                documents.push(committed);
                totalChunks += committed.chunksInserted;
            }
        }
        if (documents.length > 0) {
            this.events.emit(event_names_1.Events.Knowledge.Committed, {
                folderId: ctx.folderId,
                documents: documents.length,
                chunks: totalChunks,
            });
        }
        return {
            data: { documents, totalChunks },
            confidence: documents.length > 0 ? 0.9 : 0.3,
            status: documents.length > 0 ? 'success' : 'partial',
            followups: documents.length > 0 ? [agent_name_enum_1.AgentName.Knowledge] : [],
        };
    }
    async commit(candidate) {
        const chunks = await this.splitter.splitIntoChunks(candidate.cleanedText);
        if (chunks.length === 0)
            return null;
        const document = await this.prisma.knowledgeDocument.create({
            data: {
                titre: candidate.titre,
                fichier: candidate.sourceUrl,
                organisme: candidate.organisme,
                version: '1',
                actif: true,
            },
        });
        const embeddings = await this.embedding.embedBatch(chunks);
        for (let i = 0; i < chunks.length; i++) {
            const vectorStr = `[${embeddings[i].join(',')}]`;
            await this.prisma.$executeRaw `
        INSERT INTO "KnowledgeChunk" (id, "documentId", texte, embedding, ordre)
        VALUES (${(0, crypto_1.randomUUID)()}, ${document.id}, ${chunks[i]}, ${vectorStr}::vector, ${i})
      `;
        }
        await this.prisma.knowledgeVersion.create({
            data: {
                documentId: document.id,
                version: '1',
                changeNote: `Import Web Research depuis ${candidate.organisme}`,
            },
        });
        await this.prisma.knowledgeCandidate.update({
            where: { id: candidate.id },
            data: { statut: 'insere' },
        });
        return {
            documentId: document.id,
            titre: document.titre,
            version: '1',
            chunksInserted: chunks.length,
        };
    }
};
exports.KnowledgeManagerAgent = KnowledgeManagerAgent;
exports.KnowledgeManagerAgent = KnowledgeManagerAgent = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(embedding_port_1.EMBEDDING_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, pdf_text_extractor_1.PdfTextExtractor,
        event_emitter_1.EventEmitter2])
], KnowledgeManagerAgent);
//# sourceMappingURL=knowledge-manager.agent.js.map