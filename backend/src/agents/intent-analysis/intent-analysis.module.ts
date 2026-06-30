import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { IntentAnalysisAgent } from './intent-analysis.agent';

@Module({
  providers: [
    IntentAnalysisAgent,
    { provide: agentToken(AgentName.IntentAnalysis), useExisting: IntentAnalysisAgent },
  ],
  exports: [IntentAnalysisAgent, agentToken(AgentName.IntentAnalysis)],
})
export class IntentAnalysisAgentModule {}
