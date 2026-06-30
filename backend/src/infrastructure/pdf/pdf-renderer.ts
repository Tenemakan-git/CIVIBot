import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface PdfStep {
  ordre: number;
  titre: string;
  description: string;
}
export interface PdfDocumentItem {
  nom: string;
  statut: string;
  obligatoire: boolean;
}
export interface PdfChecklist {
  titre: string;
  items: { texte: string; coche: boolean; ordre: number }[];
}
export interface PdfSource {
  organisme: string;
  url?: string | null;
}

/** Modèle de rendu du dossier administratif. */
export interface PdfFolderModel {
  titre: string;
  domaine: string;
  statut: string;
  progression: number;
  cout?: string | null;
  delai?: string | null;
  steps: PdfStep[];
  documents: PdfDocumentItem[];
  checklists: PdfChecklist[];
  sources: PdfSource[];
  tips: string[];
}

/**
 * Génère le PDF d'un dossier administratif (procédure, étapes, documents,
 * checklist, conseils, sources) avec pdfkit. Infrastructure pure : produit un
 * Buffer, ne connaît ni le stockage ni la persistance.
 */
@Injectable()
export class PdfRenderer {
  render(model: PdfFolderModel): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
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

  private header(doc: PDFKit.PDFDocument, m: PdfFolderModel): void {
    doc.fontSize(20).fillColor('#0b5d3b').text('CiviBot — Dossier administratif');
    doc.moveDown(0.3);
    doc.fontSize(15).fillColor('#000').text(m.titre);
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .fillColor('#555')
      .text(
        `Domaine : ${m.domaine}   ·   Statut : ${m.statut}   ·   Avancement : ${m.progression}%`,
      );
    if (m.cout || m.delai) {
      doc.text(
        [m.cout ? `Coût estimé : ${m.cout}` : null, m.delai ? `Délai : ${m.delai}` : null]
          .filter(Boolean)
          .join('   ·   '),
      );
    }
    doc.moveDown();
    doc.fillColor('#000');
  }

  private section(doc: PDFKit.PDFDocument, title: string): void {
    doc.moveDown(0.6);
    doc.fontSize(13).fillColor('#0b5d3b').text(title);
    doc.moveDown(0.2);
    doc.fontSize(11).fillColor('#000');
  }

  private steps(doc: PDFKit.PDFDocument, steps: PdfStep[]): void {
    if (steps.length === 0) return;
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

  private documents(doc: PDFKit.PDFDocument, docs: PdfDocumentItem[]): void {
    if (docs.length === 0) return;
    this.section(doc, 'Pièces du dossier');
    docs.forEach((d) => {
      const mark = d.statut === 'fourni' ? '[x]' : '[ ]';
      const flag = d.obligatoire ? ' (obligatoire)' : '';
      doc.text(`${mark} ${d.nom}${flag}`);
    });
  }

  private checklists(doc: PDFKit.PDFDocument, lists: PdfChecklist[]): void {
    if (lists.length === 0) return;
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

  private tips(doc: PDFKit.PDFDocument, tips: string[]): void {
    if (tips.length === 0) return;
    this.section(doc, 'Conseils');
    tips.forEach((t) => doc.text(`• ${t}`));
  }

  private sources(doc: PDFKit.PDFDocument, sources: PdfSource[]): void {
    if (sources.length === 0) return;
    this.section(doc, 'Sources officielles');
    sources.forEach((s) =>
      doc.fontSize(10).text(`${s.organisme}${s.url ? ` — ${s.url}` : ''}`),
    );
  }

  private footer(doc: PDFKit.PDFDocument): void {
    doc.moveDown(1.2);
    doc
      .fontSize(8)
      .fillColor('#888')
      .text(
        `Document généré par CiviBot le ${new Date().toLocaleDateString('fr-FR')}. À vérifier auprès des organismes officiels.`,
      );
  }
}
