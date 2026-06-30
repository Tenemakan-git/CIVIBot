import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FolderService } from './folder.service';

/**
 * Maintient une checklist déterministe « Documents à fournir » par dossier,
 * miroir des documents requis (`FolderDocument`). Aucune dépendance au LLM :
 * la liste vient directement des pièces du dossier, et le coche reflète le
 * statut fourni/manquant. Le toggle est bidirectionnel (checklist ↔ document)
 * et recalcule la progression du dossier.
 */
@Injectable()
export class RequiredDocsChecklistService {
  static readonly TITLE = 'Documents à fournir';

  constructor(
    private readonly prisma: PrismaService,
    private readonly folders: FolderService,
  ) {}

  /** (Re)construit la checklist « Documents à fournir » à partir des pièces. */
  async sync(folderId: string): Promise<void> {
    const folder = await this.prisma.administrativeFolder.findUnique({
      where: { id: folderId },
      select: { userId: true },
    });
    if (!folder) return;

    const docs = await this.prisma.folderDocument.findMany({
      where: { folderId },
      orderBy: { createdAt: 'asc' },
    });
    if (docs.length === 0) return;

    let checklist = await this.prisma.checklist.findFirst({
      where: { folderId, titre: RequiredDocsChecklistService.TITLE },
    });
    if (!checklist) {
      checklist = await this.prisma.checklist.create({
        data: {
          userId: folder.userId,
          folderId,
          titre: RequiredDocsChecklistService.TITLE,
        },
      });
    }

    // Reconstruit les items pour refléter exactement l'état des documents.
    await this.prisma.checklistItem.deleteMany({
      where: { checklistId: checklist.id },
    });
    await this.prisma.checklistItem.createMany({
      data: docs.map((d, i) => ({
        checklistId: checklist!.id,
        texte: d.obligatoire ? d.nom : `${d.nom} (optionnel)`,
        coche: d.statut === 'fourni',
        ordre: i,
        folderDocumentId: d.id,
      })),
    });
  }

  /**
   * Marque un document requis fourni/manquant et synchronise : le document,
   * les items de checklist liés, puis la progression du dossier.
   */
  async setDocProvided(folderDocumentId: string, fourni: boolean): Promise<void> {
    const doc = await this.prisma.folderDocument.findUnique({
      where: { id: folderDocumentId },
    });
    if (!doc) return;

    await this.prisma.folderDocument.update({
      where: { id: folderDocumentId },
      data: { statut: fourni ? 'fourni' : 'manquant' },
    });
    await this.prisma.checklistItem.updateMany({
      where: { folderDocumentId },
      data: { coche: fourni },
    });
    await this.folders.recomputeProgress(doc.folderId);
  }
}
