import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { KnowledgeAgent } from './knowledge.agent';
import { KnowledgeSearchService } from './knowledge-search.service';

@Module({
  providers: [
    KnowledgeSearchService,
    KnowledgeAgent,
    { provide: agentToken(AgentName.Knowledge), useExisting: KnowledgeAgent },
  ],
  exports: [KnowledgeAgent, agentToken(AgentName.Knowledge)],
})
export class KnowledgeAgentModule {}
