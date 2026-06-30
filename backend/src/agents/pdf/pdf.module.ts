import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { FolderModule } from '../../folders/folder.module';
import { PdfService } from './pdf.service';
import { PdfAgent } from './pdf.agent';
import { PdfController } from './pdf.controller';

@Module({
  imports: [FolderModule],
  controllers: [PdfController],
  providers: [
    PdfService,
    PdfAgent,
    { provide: agentToken(AgentName.Pdf), useExisting: PdfAgent },
  ],
  exports: [PdfAgent, PdfService, agentToken(AgentName.Pdf)],
})
export class PdfAgentModule {}
