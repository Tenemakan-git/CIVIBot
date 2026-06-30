import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { FolderModule } from '../../folders/folder.module';
import { VerificationAgent } from './verification.agent';

@Module({
  imports: [FolderModule],
  providers: [
    VerificationAgent,
    {
      provide: agentToken(AgentName.Verification),
      useExisting: VerificationAgent,
    },
  ],
  exports: [VerificationAgent, agentToken(AgentName.Verification)],
})
export class VerificationAgentModule {}
