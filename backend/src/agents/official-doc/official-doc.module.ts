import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { FolderModule } from '../../folders/folder.module';
import { OfficialDocService } from './official-doc.service';
import { OfficialDocAgent } from './official-doc.agent';
import { OfficialDocController } from './official-doc.controller';

@Module({
  imports: [FolderModule],
  controllers: [OfficialDocController],
  providers: [
    OfficialDocService,
    OfficialDocAgent,
    { provide: agentToken(AgentName.OfficialDocument), useExisting: OfficialDocAgent },
  ],
  exports: [
    OfficialDocAgent,
    OfficialDocService,
    agentToken(AgentName.OfficialDocument),
  ],
})
export class OfficialDocAgentModule {}
