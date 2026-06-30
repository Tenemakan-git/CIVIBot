import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequiredDocsChecklistService } from '../../folders/application/required-docs-checklist.service';

@Injectable()
export class ChecklistsService {
  constructor(
    private prisma: PrismaService,
    private requiredDocs: RequiredDocsChecklistService,
  ) {}

  findAll(userId: string) {
    return this.prisma.checklist.findMany({
      where: { userId },
      include: { items: { orderBy: { ordre: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.checklist.findFirst({
      where: { id, userId },
      include: { items: { orderBy: { ordre: 'asc' } } },
    });
  }

  async create(userId: string, titre: string, items: string[]) {
    return this.prisma.checklist.create({
      data: {
        userId,
        titre,
        items: {
          create: items.map((texte, ordre) => ({ texte, ordre })),
        },
      },
      include: { items: true },
    });
  }

  async toggleItem(checklistId: string, itemId: string, userId: string, coche: boolean) {
    const checklist = await this.prisma.checklist.findFirst({ where: { id: checklistId, userId } });
    if (!checklist) throw new NotFoundException();
    const item = await this.prisma.checklistItem.findFirst({ where: { id: itemId, checklistId } });
    if (!item) throw new NotFoundException();

    // Item lié à un document requis : on synchronise le document (statut),
    // les items liés et la progression du dossier.
    if (item.folderDocumentId) {
      await this.requiredDocs.setDocProvided(item.folderDocumentId, coche);
      return { ...item, coche };
    }
    return this.prisma.checklistItem.update({ where: { id: itemId }, data: { coche } });
  }

  async remove(id: string, userId: string) {
    await this.prisma.checklist.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.checklist.delete({ where: { id } });
  }
}
