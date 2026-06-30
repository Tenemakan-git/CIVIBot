import { Injectable } from '@nestjs/common';

const MAX_LENGTH = 12000;

/** Étape 3 — Nettoyage du texte extrait (normalisation, plafonnement). */
@Injectable()
export class CleanStage {
  run(text: string): string {
    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/(\S{200,})/g, ' ') // jette les blobs sans espace (scripts résiduels)
      .trim();
    return cleaned.slice(0, MAX_LENGTH);
  }
}
