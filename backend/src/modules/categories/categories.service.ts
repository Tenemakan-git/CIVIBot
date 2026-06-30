import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertCategoryDto } from './dto/upsert-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.categorie.findMany({
      include: { domaine: true, _count: { select: { procedures: true } } },
    });
  }

  findByDomaine(domaineSlug: string) {
    return this.prisma.categorie.findMany({
      where: { domaine: { slug: domaineSlug } },
      include: { domaine: true },
    });
  }

  create(dto: UpsertCategoryDto) {
    return this.prisma.categorie.create({ data: dto, include: { domaine: true } });
  }

  update(id: string, dto: Partial<UpsertCategoryDto>) {
    return this.prisma.categorie.update({ where: { id }, data: dto, include: { domaine: true } });
  }

  remove(id: string) {
    return this.prisma.categorie.delete({ where: { id } });
  }

  findDomaines() {
    return this.prisma.domaine.findMany({ include: { categories: true } });
  }
}
