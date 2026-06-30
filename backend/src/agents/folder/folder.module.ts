import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { FolderModule } from '../../folders/folder.module';
import { FolderAgent } from './folder.agent';

/**
 * Module du Folder Agent. Expose l'agent sous son token DI (`AGENT_folder`)
 * pour que l'Orchestration le collecte dans l'AgentRegistry (étape suivante).
 */
@Module({
  imports: [FolderModule],
  providers: [
    FolderAgent,
    { provide: agentToken(AgentName.Folder), useExisting: FolderAgent },
  ],
  exports: [FolderAgent, agentToken(AgentName.Folder)],
})
export class FolderAgentModule {}
