import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { ServiceDirectoryModule } from '../../services-directory/service-directory.module';
import { OrientationAgent } from './orientation.agent';

@Module({
  imports: [ServiceDirectoryModule],
  providers: [
    OrientationAgent,
    { provide: agentToken(AgentName.Orientation), useExisting: OrientationAgent },
  ],
  exports: [OrientationAgent, agentToken(AgentName.Orientation)],
})
export class OrientationAgentModule {}
