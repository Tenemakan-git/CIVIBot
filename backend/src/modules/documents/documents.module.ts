import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../../prisma/prisma.module';

// LLM_PROVIDER + PdfTextExtractor sont fournis par l'InfrastructureModule (@Global).
@Module({
  imports: [PrismaModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
