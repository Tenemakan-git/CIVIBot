import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, userId } });
    if (!conv) throw new ForbiddenException();
    return this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  }

  async saveUserMessage(conversationId: string, contenu: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, userId } });
    if (!conv) throw new ForbiddenException();
    return this.prisma.message.create({
      data: { conversationId, sender: 'USER', contenu },
    });
  }

  async getLastUserMessage(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, userId } });
    if (!conv) throw new ForbiddenException();
    const msg = await this.prisma.message.findFirst({
      where: { conversationId, sender: 'USER' },
      orderBy: { createdAt: 'desc' },
    });
    if (!msg) throw new NotFoundException('Aucun message utilisateur');
    return msg;
  }
}
