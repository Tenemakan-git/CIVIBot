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
var IngestionPipeline_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionPipeline = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const search_stage_1 = require("./search.stage");
const extract_stage_1 = require("./extract.stage");
const clean_stage_1 = require("./clean.stage");
const dedup_stage_1 = require("./dedup.stage");
const MIN_USEFUL_LENGTH = 200;
const RAW_CAP = 20000;
let IngestionPipeline = IngestionPipeline_1 = class IngestionPipeline {
    search;
    extract;
    clean;
    dedup;
    prisma;
    logger = new common_1.Logger(IngestionPipeline_1.name);
    constructor(search, extract, clean, dedup, prisma) {
        this.search = search;
        this.extract = extract;
        this.clean = clean;
        this.dedup = dedup;
        this.prisma = prisma;
    }
    async run(query, limit = 5) {
        const hits = await this.search.run(query, limit);
        const staged = [];
        const seenInBatch = new Set();
        for (const hit of hits) {
            try {
                const page = await this.extract.run(hit);
                const cleaned = this.clean.run(page.text);
                if (cleaned.length < MIN_USEFUL_LENGTH)
                    continue;
                const contentHash = this.dedup.hash(cleaned);
                if (seenInBatch.has(contentHash))
                    continue;
                seenInBatch.add(contentHash);
                if (!(await this.dedup.isNew(contentHash)))
                    continue;
                const record = await this.prisma.knowledgeCandidate.create({
                    data: {
                        organisme: page.organisme,
                        sourceUrl: page.sourceUrl,
                        titre: page.titre,
                        rawText: page.text.slice(0, RAW_CAP),
                        cleanedText: cleaned,
                        contentHash,
                        statut: 'en_attente',
                    },
                });
                staged.push({
                    id: record.id,
                    organisme: record.organisme,
                    sourceUrl: record.sourceUrl,
                    titre: record.titre,
                    contentHash,
                });
            }
            catch (err) {
                this.logger.warn(`Ingestion ignorée pour ${hit.url}: ${err.message}`);
            }
        }
        return staged;
    }
};
exports.IngestionPipeline = IngestionPipeline;
exports.IngestionPipeline = IngestionPipeline = IngestionPipeline_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [search_stage_1.SearchStage,
        extract_stage_1.ExtractStage,
        clean_stage_1.CleanStage,
        dedup_stage_1.DedupStage,
        prisma_service_1.PrismaService])
], IngestionPipeline);
//# sourceMappingURL=ingestion-pipeline.js.map