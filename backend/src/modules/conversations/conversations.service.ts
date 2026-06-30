import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId, statut: { not: 'supprimee' } },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  create(userId: string, titre?: string) {
    return this.prisma.conversation.create({
      data: { userId, titre: titre || 'Nouvelle conversation' },
    });
  }

  async findOne(id: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conv) throw new ForbiddenException();
    return conv;
  }

  async update(id: string, userId: string, data: { titre?: string }) {
    await this.findOne(id, userId);
    return this.prisma.conversation.update({ where: { id }, data });
  }

  async archive(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.conversation.update({ where: { id }, data: { statut: 'archivee' } });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.conversation.delete({ where: { id } });
  }
}
