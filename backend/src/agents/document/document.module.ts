import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { DocumentAgent } from './document.agent';

@Module({
  providers: [
    DocumentAgent,
    { provide: agentToken(AgentName.Document), useExisting: DocumentAgent },
  ],
  exports: [DocumentAgent, agentToken(AgentName.Document)],
})
export class DocumentAgentModule {}
