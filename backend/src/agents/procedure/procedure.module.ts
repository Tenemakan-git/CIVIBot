import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { ProcedureAgent } from './procedure.agent';

@Module({
  providers: [
    ProcedureAgent,
    { provide: agentToken(AgentName.Procedure), useExisting: ProcedureAgent },
  ],
  exports: [ProcedureAgent, agentToken(AgentName.Procedure)],
})
export class ProcedureAgentModule {}
