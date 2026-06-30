import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { KnowledgeManagerAgent } from './knowledge-manager.agent';

@Module({
  providers: [
    KnowledgeManagerAgent,
    {
      provide: agentToken(AgentName.KnowledgeManager),
      useExisting: KnowledgeManagerAgent,
    },
  ],
  exports: [KnowledgeManagerAgent, agentToken(AgentName.KnowledgeManager)],
})
export class KnowledgeManagerAgentModule {}
