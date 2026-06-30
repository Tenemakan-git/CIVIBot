import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { FolderService } from '../../folders/application/folder.service';
import {
  PdfFolderModel,
  PdfRenderer,
  PdfStep,
} from '../../infrastructure/pdf/pdf-renderer';

export interface RenderedPdf {
  buffer: Buffer;
  storageKey: string;
  filename: string;
  bytes: number;
}

/**
 * Application du PDF Agent : assemble le modèle du dossier (vue + checklist),
 * délègue le rendu au PdfRenderer, persiste le fichier et la trace FolderPdf.
 */
@Injectable()
export class PdfService {
  private readonly storageDir =
    process.env.PDF_STORAGE_DIR || path.join(process.cwd(), 'storage', 'pdf');

  constructor(
    private readonly folders: FolderService,
    private readonly prisma: PrismaService,
    private readonly renderer: PdfRenderer,
  ) {}

  async generate(
    folderId: string,
    userId: string,
    tips: string[] = [],
  ): Promise<RenderedPdf> {
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

  private async buildModel(
    folderId: string,
    userId: string,
    tips: string[],
  ): Promise<PdfFolderModel> {
    const view = await this.folders.getView(folderId, userId); // contrôle d'appartenance

    const rawSteps = Array.isArray(view.plan?.steps)
      ? (view.plan?.steps as unknown[])
      : [];
    const steps: PdfStep[] = rawSteps.map((s, i) => {
      const o = (s ?? {}) as Record<string, unknown>;
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
}
