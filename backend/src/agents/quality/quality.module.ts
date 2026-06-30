import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { QualityAgent } from './quality.agent';

@Module({
  providers: [
    QualityAgent,
    { provide: agentToken(AgentName.Quality), useExisting: QualityAgent },
  ],
  exports: [QualityAgent, agentToken(AgentName.Quality)],
})
export class QualityAgentModule {}
