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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfficialDocService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_service_1 = require("../../prisma/prisma.service");
const folder_service_1 = require("../../folders/application/folder.service");
const llm_port_1 = require("../../core/ports/llm.port");
const official_doc_renderer_1 = require("../../infrastructure/pdf/official-doc-renderer");
const document_templates_1 = require("./templates/document-templates");
let OfficialDocService = class OfficialDocService {
    folders;
    prisma;
    renderer;
    llm;
    storageDir = process.env.DOC_STORAGE_DIR ||
        path.join(process.cwd(), 'storage', 'documents');
    system = "Tu es l'assistant de rédaction administrative de CiviBot (Côte d'Ivoire). " +
        'Tu rédiges un texte formel, poli et concis en français.';
    constructor(folders, prisma, renderer, llm) {
        this.folders = folders;
        this.prisma = prisma;
        this.renderer = renderer;
        this.llm = llm;
    }
    async listTemplates(folderId, userId) {
        const view = await this.folders.getView(folderId, userId);
        return (0, document_templates_1.templatesForDomaine)(view.domaine, view.procedureSlug).map((t) => ({
            key: t.key,
            titre: t.titre,
            description: t.description,
            fields: t.fields.map((f) => ({
                key: f.key,
                label: f.label,
                required: f.required,
                source: f.source,
                example: f.example,
            })),
        }));
    }
    async listGenerated(folderId, userId) {
        await this.folders.getView(folderId, userId);
        const rows = await this.prisma.generatedDocument.findMany({
            where: { folderId },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((r) => ({
            id: r.id,
            templateKey: r.templateKey,
            titre: r.titre,
            filename: r.filename,
            bytes: r.bytes,
            createdAt: r.createdAt,
        }));
    }
    async generate(folderId, userId, templateKey, askFields = {}) {
        const view = await this.folders.getView(folderId, userId);
        const template = (0, document_templates_1.getTemplate)(templateKey);
        if (!template)
            throw new common_1.NotFoundException('Modèle de document introuvable');
        if (!template.domaines.includes(view.domaine)) {
            throw new common_1.BadRequestException("Ce modèle ne s'applique pas au domaine de ce dossier");
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        const values = this.resolveFields(template, view, user, askFields);
        const corps = await this.buildCorps(template, values);
        const dateStr = new Date().toLocaleDateString('fr-FR');
        const model = {
            titre: template.titre,
            expediteur: {
                nom: values.nomComplet || `${user.prenom} ${user.nom}`.trim(),
                telephone: values.telephone || user.telephone || null,
            },
            destinataire: template.destinataire,
            lieuDate: `Le ${dateStr}`,
            objet: this.interpolate(template.objet, values),
            corps,
            signatureLabel: 'Signature',
        };
        const buffer = await this.renderer.render(model);
        fs.mkdirSync(this.storageDir, { recursive: true });
        const filename = `${template.key}-${folderId}-${Date.now()}.pdf`;
        const storageKey = path.join(this.storageDir, filename);
        fs.writeFileSync(storageKey, buffer);
        const row = await this.prisma.generatedDocument.create({
            data: {
                folderId,
                templateKey: template.key,
                titre: template.titre,
                storageKey,
                filename,
                bytes: buffer.length,
                fields: values,
            },
        });
        await this.folders.recordTimeline(folderId, {
            type: 'agent_step',
            label: `Document généré : ${template.titre}`,
        });
        return {
            id: row.id,
            templateKey: template.key,
            titre: template.titre,
            filename,
            bytes: buffer.length,
            createdAt: row.createdAt,
            storageKey,
            buffer,
        };
    }
    async getFile(folderId, docId, userId) {
        await this.folders.getView(folderId, userId);
        const row = await this.prisma.generatedDocument.findFirst({
            where: { id: docId, folderId },
        });
        if (!row)
            throw new common_1.NotFoundException('Document introuvable');
        if (!fs.existsSync(row.storageKey)) {
            throw new common_1.NotFoundException('Fichier du document introuvable');
        }
        return { buffer: fs.readFileSync(row.storageKey), filename: row.filename };
    }
    resolveFields(template, view, user, askFields) {
        const values = {};
        const missing = [];
        for (const field of template.fields) {
            const value = this.readField(field, view, user, askFields);
            values[field.key] = value;
            if (field.required && !value.trim())
                missing.push(field.label);
        }
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`Champs requis manquants : ${missing.join(', ')}`);
        }
        return values;
    }
    readField(field, view, user, askFields) {
        switch (field.source) {
            case 'user':
                if (field.key === 'nomComplet')
                    return `${user.prenom} ${user.nom}`.trim();
                if (field.key === 'telephone')
                    return user.telephone ?? '';
                return '';
            case 'folder':
                if (field.key === 'titre')
                    return view.titre;
                if (field.key === 'domaine')
                    return view.domaine;
                if (field.key === 'procedure')
                    return view.procedureSlug ?? '';
                return '';
            case 'ask':
            default:
                return (askFields[field.key] ?? '').trim();
        }
    }
    async buildCorps(template, values) {
        if (template.bodyInstruction) {
            const instruction = this.interpolate(template.bodyInstruction, values);
            const result = await this.llm.complete({
                tier: 'generation',
                system: this.system,
                messages: [{ role: 'user', content: instruction }],
            });
            return result.text.trim();
        }
        return this.interpolate(template.staticBody ?? '', values);
    }
    interpolate(tpl, values) {
        return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => (values[key] ?? '').trim());
    }
};
exports.OfficialDocService = OfficialDocService;
exports.OfficialDocService = OfficialDocService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)(llm_port_1.LLM_PROVIDER)),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        prisma_service_1.PrismaService,
        official_doc_renderer_1.OfficialDocRenderer, Object])
], OfficialDocService);
//# sourceMappingURL=official-doc.service.js.map