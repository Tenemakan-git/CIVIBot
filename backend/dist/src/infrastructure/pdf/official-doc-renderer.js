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
exports.OfficialDocRenderer = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let OfficialDocRenderer = class OfficialDocRenderer {
    render(model) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 60, size: 'A4' });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            this.expediteur(doc, model);
            this.destinataire(doc, model);
            this.lieuDate(doc, model);
            this.objet(doc, model);
            this.corps(doc, model);
            this.signature(doc, model);
            this.footer(doc);
            doc.end();
        });
    }
    expediteur(doc, m) {
        doc.font('Helvetica').fontSize(11).fillColor('#000');
        doc.text(m.expediteur.nom);
        if (m.expediteur.telephone)
            doc.text(`Tél. : ${m.expediteur.telephone}`);
    }
    destinataire(doc, m) {
        doc.moveDown(2);
        doc.text(m.destinataire, { align: 'right' });
    }
    lieuDate(doc, m) {
        doc.moveDown(1.5);
        doc.text(m.lieuDate, { align: 'right' });
    }
    objet(doc, m) {
        doc.moveDown(2);
        doc.font('Helvetica-Bold').text(`Objet : ${m.objet}`);
        doc.font('Helvetica');
    }
    corps(doc, m) {
        doc.moveDown(1.5);
        doc.fontSize(11).fillColor('#000');
        m.corps.split('\n').forEach((line) => {
            if (line.trim() === '')
                doc.moveDown(0.6);
            else
                doc.text(line, { align: 'justify', lineGap: 2 });
        });
    }
    signature(doc, m) {
        doc.moveDown(2.5);
        doc.text(m.signatureLabel, { align: 'right' });
        doc.moveDown(0.3);
        doc.fillColor('#888').text(m.expediteur.nom, { align: 'right' });
        doc.fillColor('#000');
    }
    footer(doc) {
        doc.moveDown(2);
        doc
            .fontSize(8)
            .fillColor('#888')
            .text(`Modèle pré-rempli généré par CiviBot le ${new Date().toLocaleDateString('fr-FR')}. ` +
            'À relire, compléter et signer. Ce document ne remplace pas un formulaire officiel ; ' +
            "vérifiez les exigences auprès de l'administration concernée.", { align: 'center' });
    }
};
exports.OfficialDocRenderer = OfficialDocRenderer;
exports.OfficialDocRenderer = OfficialDocRenderer = __decorate([
    (0, common_1.Injectable)()
], OfficialDocRenderer);
//# sourceMappingURL=official-doc-renderer.js.map