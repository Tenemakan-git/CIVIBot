"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfRenderer = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PdfRenderer = class PdfRenderer {
    render(model) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            this.header(doc, model);
            this.steps(doc, model.steps);
            this.documents(doc, model.documents);
            this.checklists(doc, model.checklists);
            this.tips(doc, model.tips);
            this.sources(doc, model.sources);
            this.footer(doc);
            doc.end();
        });
    }
    header(doc, m) {
        doc.fontSize(20).fillColor('#0b5d3b').text('CiviBot — Dossier administratif');
        doc.moveDown(0.3);
        doc.fontSize(15).fillColor('#000').text(m.titre);
        doc.moveDown(0.3);
        doc
            .fontSize(10)
            .fillColor('#555')
            .text(`Domaine : ${m.domaine}   ·   Statut : ${m.statut}   ·   Avancement : ${m.progression}%`);
        if (m.cout || m.delai) {
            doc.text([m.cout ? `Coût estimé : ${m.cout}` : null, m.delai ? `Délai : ${m.delai}` : null]
                .filter(Boolean)
                .join('   ·   '));
        }
        doc.moveDown();
        doc.fillColor('#000');
    }
    section(doc, title) {
        doc.moveDown(0.6);
        doc.fontSize(13).fillColor('#0b5d3b').text(title);
        doc.moveDown(0.2);
        doc.fontSize(11).fillColor('#000');
    }
    steps(doc, steps) {
        if (steps.length === 0)
            return;
        this.section(doc, 'Étapes de la procédure');
        steps
            .slice()
            .sort((a, b) => a.ordre - b.ordre)
            .forEach((s) => {
            doc.font('Helvetica-Bold').text(`${s.ordre}. ${s.titre}`);
            if (s.description)
                doc.font('Helvetica').fillColor('#333').text(s.description, { indent: 12 });
            doc.fillColor('#000');
        });
    }
    documents(doc, docs) {
        if (docs.length === 0)
            return;
        this.section(doc, 'Pièces du dossier');
        docs.forEach((d) => {
            const mark = d.statut === 'fourni' ? '[x]' : '[ ]';
            const flag = d.obligatoire ? ' (obligatoire)' : '';
            doc.text(`${mark} ${d.nom}${flag}`);
        });
    }
    checklists(doc, lists) {
        if (lists.length === 0)
            return;
        this.section(doc, 'Checklist');
        lists.forEach((cl) => {
            doc.font('Helvetica-Bold').text(cl.titre);
            doc.font('Helvetica');
            cl.items
                .slice()
                .sort((a, b) => a.ordre - b.ordre)
                .forEach((it) => doc.text(`${it.coche ? '[x]' : '[ ]'} ${it.texte}`, { indent: 12 }));
        });
    }
    tips(doc, tips) {
        if (tips.length === 0)
            return;
        this.section(doc, 'Conseils');
        tips.forEach((t) => doc.text(`• ${t}`));
    }
    sources(doc, sources) {
        if (sources.length === 0)
            return;
        this.section(doc, 'Sources officielles');
        sources.forEach((s) => doc.fontSize(10).text(`${s.organisme}${s.url ? ` — ${s.url}` : ''}`));
    }
    footer(doc) {
        doc.moveDown(1.2);
        doc
            .fontSize(8)
            .fillColor('#888')
            .text(`Document généré par CiviBot le ${new Date().toLocaleDateString('fr-FR')}. À vérifier auprès des organismes officiels.`);
    }
};
exports.PdfRenderer = PdfRenderer;
exports.PdfRenderer = PdfRenderer = __decorate([
    (0, common_1.Injectable)()
], PdfRenderer);
//# sourceMappingURL=pdf-renderer.js.map