import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@Injectable()
export class ProceduresService {
  constructor(private prisma: PrismaService) {}

  findAll(categorieId?: string) {
    return this.prisma.procedure.findMany({
      where: categorieId ? { categorieId } : undefined,
      include: {
        categorie: { include: { domaine: true } },
        steps: { orderBy: { ordre: 'asc' } },
        documents: true,
        faqs: true,
        sources: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublished(categorieId?: string) {
    return this.prisma.procedure.findMany({
      where: { actif: true, ...(categorieId ? { categorieId } : {}) },
      include: {
        categorie: { include: { domaine: true } },
        steps: { orderBy: { ordre: 'asc' } },
        documents: true,
        faqs: true,
        sources: true,
      },
    });
  }

  async findOne(id: string) {
    const proc = await this.prisma.procedure.findUnique({
      where: { id },
      include: {
        categorie: { include: { domaine: true } },
        steps: { orderBy: { ordre: 'asc' } },
        documents: true,
        faqs: true,
        sources: true,
      },
    });
    if (!proc) throw new NotFoundException('Procédure non trouvée');
    return proc;
  }

  create(dto: CreateProcedureDto) {
    return this.prisma.procedure.create({ data: dto });
  }

  update(id: string, dto: UpdateProcedureDto) {
    return this.prisma.procedure.update({ where: { id }, data: dto });
  }

  publish(id: string) {
    return this.prisma.procedure.update({ where: { id }, data: { actif: true } });
  }

  remove(id: string) {
    return this.prisma.procedure.delete({ where: { id } });
  }
}
