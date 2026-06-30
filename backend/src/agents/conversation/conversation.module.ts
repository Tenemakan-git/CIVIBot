import { Module } from '@nestjs/common';
import { OrchestrationModule } from '../../orchestration/orchestration.module';
import { ConversationAgent } from './conversation.agent';
import { ConversationController } from './conversation.controller';

/**
 * Module du Conversation Agent (façade d'entrée). N'est PAS enregistré dans
 * l'AgentRegistry : il enveloppe l'Orchestrator plutôt que d'être orchestré.
 */
@Module({
  imports: [OrchestrationModule],
  controllers: [ConversationController],
  providers: [ConversationAgent],
  exports: [ConversationAgent],
})
export class ConversationAgentModule {}
