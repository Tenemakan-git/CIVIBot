import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

/** Modèle d'une lettre administrative officielle pré-remplie. */
export interface OfficialDocModel {
  titre: string;
  expediteur: { nom: string; telephone?: string | null };
  destinataire: string;
  lieuDate: string;
  objet: string;
  corps: string;
  signatureLabel: string;
}

/**
 * Rend un document administratif type courrier (expéditeur, destinataire,
 * lieu/date, objet, corps, signature) avec pdfkit. Infrastructure pure :
 * produit un Buffer, ne connaît ni le stockage ni la persistance.
 *
 * Le pied de page marque clairement qu'il s'agit d'un MODÈLE à vérifier et
 * signer — jamais une reproduction d'un formulaire officiel tamponné.
 */
@Injectable()
export class OfficialDocRenderer {
  render(model: OfficialDocModel): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
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

  private expediteur(doc: PDFKit.PDFDocument, m: OfficialDocModel): void {
    doc.font('Helvetica').fontSize(11).fillColor('#000');
    doc.text(m.expediteur.nom);
    if (m.expediteur.telephone) doc.text(`Tél. : ${m.expediteur.telephone}`);
  }

  private destinataire(doc: PDFKit.PDFDocument, m: OfficialDocModel): void {
    doc.moveDown(2);
    // Aligné à droite, façon courrier.
    doc.text(m.destinataire, { align: 'right' });
  }

  private lieuDate(doc: PDFKit.PDFDocument, m: OfficialDocModel): void {
    doc.moveDown(1.5);
    doc.text(m.lieuDate, { align: 'right' });
  }

  private objet(doc: PDFKit.PDFDocument, m: OfficialDocModel): void {
    doc.moveDown(2);
    doc.font('Helvetica-Bold').text(`Objet : ${m.objet}`);
    doc.font('Helvetica');
  }

  private corps(doc: PDFKit.PDFDocument, m: OfficialDocModel): void {
    doc.moveDown(1.5);
    doc.fontSize(11).fillColor('#000');
    m.corps.split('\n').forEach((line) => {
      if (line.trim() === '') doc.moveDown(0.6);
      else doc.text(line, { align: 'justify', lineGap: 2 });
    });
  }

  private signature(doc: PDFKit.PDFDocument, m: OfficialDocModel): void {
    doc.moveDown(2.5);
    doc.text(m.signatureLabel, { align: 'right' });
    doc.moveDown(0.3);
    doc.fillColor('#888').text(m.expediteur.nom, { align: 'right' });
    doc.fillColor('#000');
  }

  private footer(doc: PDFKit.PDFDocument): void {
    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor('#888')
      .text(
        `Modèle pré-rempli généré par CiviBot le ${new Date().toLocaleDateString('fr-FR')}. ` +
          'À relire, compléter et signer. Ce document ne remplace pas un formulaire officiel ; ' +
          "vérifiez les exigences auprès de l'administration concernée.",
        { align: 'center' },
      );
  }
}
