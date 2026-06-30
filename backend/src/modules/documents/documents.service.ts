import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LLM_PROVIDER } from '../../core/ports/llm.port';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { PdfTextExtractor } from '../../infrastructure/pdf/pdf-text-extractor';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(LLM_PROVIDER) private llm: ILlmProvider,
    private pdf: PdfTextExtractor,
  ) {}

  findAll(userId: string) {
    return this.prisma.userDocument.findMany({
      where: { userId },
      include: { analysis: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.userDocument.findFirst({
      where: { id, userId },
      include: { analysis: true },
    });
  }

  async upload(userId: string, file: Express.Multer.File, nom?: string) {
    const doc = await this.prisma.userDocument.create({
      data: {
        userId,
        nom: nom || file.originalname,
        type: file.mimetype,
        chemin: file.path,
        taille: file.size,
      },
    });

    try {
      const text = await this.pdf.extractText(file.path);
      const resume = await this.summarize(text);
      await this.prisma.documentAnalysis.create({
        data: {
          documentId: doc.id,
          texteOcr: text.slice(0, 10000),
          resume,
          lisible: true,
        },
      });
    } catch {
      await this.prisma.documentAnalysis.create({
        data: { documentId: doc.id, lisible: false },
      });
    }

    return this.prisma.userDocument.findUnique({
      where: { id: doc.id },
      include: { analysis: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.prisma.userDocument.findFirstOrThrow({ where: { id, userId } });
    return this.prisma.userDocument.delete({ where: { id } });
  }

  /** Résumé d'un document via le provider LLM (repli géré par l'adapter). */
  private async summarize(text: string): Promise<string> {
    try {
      const { text: resume } = await this.llm.complete({
        tier: 'generation',
        maxTokens: 256,
        messages: [
          {
            role: 'user',
            content: `Résume ce document administratif en 3-5 phrases en français :\n\n${text.slice(0, 3000)}`,
          },
        ],
      });
      return resume;
    } catch {
      return 'Résumé non disponible.';
    }
  }
}
