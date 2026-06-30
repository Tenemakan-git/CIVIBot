import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { KnowledgeValidationAgent } from './knowledge-validation.agent';

@Module({
  providers: [
    KnowledgeValidationAgent,
    {
      provide: agentToken(AgentName.KnowledgeValidation),
      useExisting: KnowledgeValidationAgent,
    },
  ],
  exports: [KnowledgeValidationAgent, agentToken(AgentName.KnowledgeValidation)],
})
export class KnowledgeValidationAgentModule {}
