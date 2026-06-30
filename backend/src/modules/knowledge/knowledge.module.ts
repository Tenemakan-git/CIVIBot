import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { PrismaModule } from '../../prisma/prisma.module';

// EMBEDDING_PROVIDER + PdfTextExtractor sont fournis par l'InfrastructureModule (@Global).
@Module({
  imports: [PrismaModule],
  providers: [KnowledgeService],
  controllers: [KnowledgeController],
})
export class KnowledgeModule {}
