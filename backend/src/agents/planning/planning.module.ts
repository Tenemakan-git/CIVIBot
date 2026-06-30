import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { PlanningAgent } from './planning.agent';

@Module({
  providers: [
    PlanningAgent,
    { provide: agentToken(AgentName.Planning), useExisting: PlanningAgent },
  ],
  exports: [PlanningAgent, agentToken(AgentName.Planning)],
})
export class PlanningAgentModule {}
