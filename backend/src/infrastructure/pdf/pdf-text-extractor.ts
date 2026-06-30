import { Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

/**
 * Extraction/découpage de PDF pour l'ingestion documentaire (reprend l'ancien
 * `PdfService`). Utilisé par le Knowledge Manager Agent.
 *
 * NB : la GÉNÉRATION de PDF (dossier administratif) relève du futur PdfAgent
 * et nécessitera une dépendance de rendu — décidée à cette étape-là.
 */
@Injectable()
export class PdfTextExtractor {
  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\n\n', '\n', '.', ' '],
  });

  async extractText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const data = await (pdfParse as any)(buffer);
    return data.text;
  }

  async splitIntoChunks(text: string): Promise<string[]> {
    return this.splitter.splitText(text);
  }

  async processDocument(filePath: string): Promise<string[]> {
    const text = await this.extractText(filePath);
    return this.splitIntoChunks(text);
  }
}
