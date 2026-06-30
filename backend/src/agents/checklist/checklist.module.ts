import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { ChecklistAgent } from './checklist.agent';

@Module({
  providers: [
    ChecklistAgent,
    { provide: agentToken(AgentName.Checklist), useExisting: ChecklistAgent },
  ],
  exports: [ChecklistAgent, agentToken(AgentName.Checklist)],
})
export class ChecklistAgentModule {}
