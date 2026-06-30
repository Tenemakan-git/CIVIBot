import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CoreModule } from './core/core.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { FolderModule } from './folders/folder.module';
import { OrchestrationModule } from './orchestration/orchestration.module';
import { IntentAnalysisAgentModule } from './agents/intent-analysis/intent-analysis.module';
import { KnowledgeAgentModule } from './agents/knowledge/knowledge.module';
import { WebResearchAgentModule } from './agents/web-research/web-research.module';
import { KnowledgeValidationAgentModule } from './agents/knowledge-validation/knowledge-validation.module';
import { KnowledgeManagerAgentModule } from './agents/knowledge-manager/knowledge-manager.module';
import { PlanningAgentModule } from './agents/planning/planning.module';
import { ProcedureAgentModule } from './agents/procedure/procedure.module';
import { ChecklistAgentModule } from './agents/checklist/checklist.module';
import { DocumentAgentModule } from './agents/document/document.module';
import { OfficialDocAgentModule } from './agents/official-doc/official-doc.module';
import { OrientationAgentModule } from './agents/orientation/orientation.module';
import { ServiceDirectoryModule } from './services-directory/service-directory.module';
import { VerificationAgentModule } from './agents/verification/verification.module';
import { QualityAgentModule } from './agents/quality/quality.module';
import { PdfAgentModule } from './agents/pdf/pdf.module';
import { MonitoringAgentModule } from './agents/monitoring/monitoring.module';
import { NotificationAgentModule } from './agents/notification/notification.module';
import { LearningAgentModule } from './agents/learning/learning.module';
import { FolderAgentModule } from './agents/folder/folder.module';
import { ConversationAgentModule } from './agents/conversation/conversation.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { ChecklistsModule } from './modules/checklists/checklists.module';
import { JourneysModule } from './modules/journeys/journeys.module';
import { StatsModule } from './modules/stats/stats.module';
import { AiSettingsController } from './modules/ai/ai-settings.controller';
import { FaqController, SourcesController } from './modules/ai/faq.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    CoreModule,
    PrismaModule,
    InfrastructureModule,
    FolderModule,
    OrchestrationModule,
    IntentAnalysisAgentModule,
    KnowledgeAgentModule,
    WebResearchAgentModule,
    KnowledgeValidationAgentModule,
    KnowledgeManagerAgentModule,
    PlanningAgentModule,
    ProcedureAgentModule,
    ChecklistAgentModule,
    DocumentAgentModule,
    OfficialDocAgentModule,
    ServiceDirectoryModule,
    OrientationAgentModule,
    VerificationAgentModule,
    QualityAgentModule,
    PdfAgentModule,
    MonitoringAgentModule,
    NotificationAgentModule,
    LearningAgentModule,
    FolderAgentModule,
    ConversationAgentModule,
    AuthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
    ProceduresModule,
    CategoriesModule,
    DocumentsModule,
    KnowledgeModule,
    ChecklistsModule,
    JourneysModule,
    StatsModule,
  ],
  controllers: [AiSettingsController, FaqController, SourcesController],
})
export class AppModule {}
