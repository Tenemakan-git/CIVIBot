"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_service_1 = require("../../prisma/prisma.service");
const folder_service_1 = require("../../folders/application/folder.service");
const pdf_renderer_1 = require("../../infrastructure/pdf/pdf-renderer");
let PdfService = class PdfService {
    folders;
    prisma;
    renderer;
    storageDir = process.env.PDF_STORAGE_DIR || path.join(process.cwd(), 'storage', 'pdf');
    constructor(folders, prisma, renderer) {
        this.folders = folders;
        this.prisma = prisma;
        this.renderer = renderer;
    }
    async generate(folderId, userId, tips = []) {
        const model = await this.buildModel(folderId, userId, tips);
        const buffer = await this.renderer.render(model);
        fs.mkdirSync(this.storageDir, { recursive: true });
        const filename = `dossier-${folderId}-${Date.now()}.pdf`;
        const storageKey = path.join(this.storageDir, filename);
        fs.writeFileSync(storageKey, buffer);
        await this.folders.recordPdf(folderId, {
            storageKey,
            filename,
            bytes: buffer.length,
        });
        await this.folders.recordTimeline(folderId, {
            type: 'agent_step',
            label: 'PDF du dossier généré',
        });
        return { buffer, storageKey, filename, bytes: buffer.length };
    }
    async buildModel(folderId, userId, tips) {
        const view = await this.folders.getView(folderId, userId);
        const rawSteps = Array.isArray(view.plan?.steps)
            ? view.plan?.steps
            : [];
        const steps = rawSteps.map((s, i) => {
            const o = (s ?? {});
            return {
                ordre: typeof o.ordre === 'number' ? o.ordre : i + 1,
                titre: String(o.titre ?? `Étape ${i + 1}`),
                description: String(o.description ?? ''),
            };
        });
        const checklists = await this.prisma.checklist.findMany({
            where: { folderId },
            include: { items: true },
        });
        return {
            titre: view.titre,
            domaine: view.domaine,
            statut: view.statut,
            progression: view.progression,
            cout: view.plan?.cout ?? null,
            delai: view.plan?.delai ?? null,
            steps,
            documents: view.documents.map((d) => ({
                nom: d.nom,
                statut: d.statut ?? 'manquant',
                obligatoire: d.obligatoire ?? true,
            })),
            checklists: checklists.map((cl) => ({
                titre: cl.titre,
                items: cl.items.map((it) => ({
                    texte: it.texte,
                    coche: it.coche,
                    ordre: it.ordre,
                })),
            })),
            sources: view.sources.map((s) => ({ organisme: s.organisme, url: s.url })),
            tips,
        };
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        prisma_service_1.PrismaService,
        pdf_renderer_1.PdfRenderer])
], PdfService);
//# sourceMappingURL=pdf.service.js.map