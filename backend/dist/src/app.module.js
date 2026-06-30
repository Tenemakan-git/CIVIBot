"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const core_module_1 = require("./core/core.module");
const infrastructure_module_1 = require("./infrastructure/infrastructure.module");
const folder_module_1 = require("./folders/folder.module");
const orchestration_module_1 = require("./orchestration/orchestration.module");
const intent_analysis_module_1 = require("./agents/intent-analysis/intent-analysis.module");
const knowledge_module_1 = require("./agents/knowledge/knowledge.module");
const web_research_module_1 = require("./agents/web-research/web-research.module");
const knowledge_validation_module_1 = require("./agents/knowledge-validation/knowledge-validation.module");
const knowledge_manager_module_1 = require("./agents/knowledge-manager/knowledge-manager.module");
const planning_module_1 = require("./agents/planning/planning.module");
const procedure_module_1 = require("./agents/procedure/procedure.module");
const checklist_module_1 = require("./agents/checklist/checklist.module");
const document_module_1 = require("./agents/document/document.module");
const official_doc_module_1 = require("./agents/official-doc/official-doc.module");
const orientation_module_1 = require("./agents/orientation/orientation.module");
const service_directory_module_1 = require("./services-directory/service-directory.module");
const verification_module_1 = require("./agents/verification/verification.module");
const quality_module_1 = require("./agents/quality/quality.module");
const pdf_module_1 = require("./agents/pdf/pdf.module");
const monitoring_module_1 = require("./agents/monitoring/monitoring.module");
const notification_module_1 = require("./agents/notification/notification.module");
const learning_module_1 = require("./agents/learning/learning.module");
const folder_module_2 = require("./agents/folder/folder.module");
const conversation_module_1 = require("./agents/conversation/conversation.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const conversations_module_1 = require("./modules/conversations/conversations.module");
const messages_module_1 = require("./modules/messages/messages.module");
const procedures_module_1 = require("./modules/procedures/procedures.module");
const categories_module_1 = require("./modules/categories/categories.module");
const documents_module_1 = require("./modules/documents/documents.module");
const knowledge_module_2 = require("./modules/knowledge/knowledge.module");
const checklists_module_1 = require("./modules/checklists/checklists.module");
const journeys_module_1 = require("./modules/journeys/journeys.module");
const stats_module_1 = require("./modules/stats/stats.module");
const ai_settings_controller_1 = require("./modules/ai/ai-settings.controller");
const faq_controller_1 = require("./modules/ai/faq.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            event_emitter_1.EventEmitterModule.forRoot(),
            core_module_1.CoreModule,
            prisma_module_1.PrismaModule,
            infrastructure_module_1.InfrastructureModule,
            folder_module_1.FolderModule,
            orchestration_module_1.OrchestrationModule,
            intent_analysis_module_1.IntentAnalysisAgentModule,
            knowledge_module_1.KnowledgeAgentModule,
            web_research_module_1.WebResearchAgentModule,
            knowledge_validation_module_1.KnowledgeValidationAgentModule,
            knowledge_manager_module_1.KnowledgeManagerAgentModule,
            planning_module_1.PlanningAgentModule,
            procedure_module_1.ProcedureAgentModule,
            checklist_module_1.ChecklistAgentModule,
            document_module_1.DocumentAgentModule,
            official_doc_module_1.OfficialDocAgentModule,
            service_directory_module_1.ServiceDirectoryModule,
            orientation_module_1.OrientationAgentModule,
            verification_module_1.VerificationAgentModule,
            quality_module_1.QualityAgentModule,
            pdf_module_1.PdfAgentModule,
            monitoring_module_1.MonitoringAgentModule,
            notification_module_1.NotificationAgentModule,
            learning_module_1.LearningAgentModule,
            folder_module_2.FolderAgentModule,
            conversation_module_1.ConversationAgentModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            conversations_module_1.ConversationsModule,
            messages_module_1.MessagesModule,
            procedures_module_1.ProceduresModule,
            categories_module_1.CategoriesModule,
            documents_module_1.DocumentsModule,
            knowledge_module_2.KnowledgeModule,
            checklists_module_1.ChecklistsModule,
            journeys_module_1.JourneysModule,
            stats_module_1.StatsModule,
        ],
        controllers: [ai_settings_controller_1.AiSettingsController, faq_controller_1.FaqController, faq_controller_1.SourcesController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map