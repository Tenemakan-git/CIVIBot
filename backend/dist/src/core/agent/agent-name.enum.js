"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentToken = exports.AgentName = void 0;
var AgentName;
(function (AgentName) {
    AgentName["Conversation"] = "conversation";
    AgentName["IntentAnalysis"] = "intent-analysis";
    AgentName["Planning"] = "planning";
    AgentName["Knowledge"] = "knowledge";
    AgentName["WebResearch"] = "web-research";
    AgentName["KnowledgeValidation"] = "knowledge-validation";
    AgentName["KnowledgeManager"] = "knowledge-manager";
    AgentName["Procedure"] = "procedure";
    AgentName["Checklist"] = "checklist";
    AgentName["Document"] = "document";
    AgentName["OfficialDocument"] = "official-document";
    AgentName["Orientation"] = "orientation";
    AgentName["Pdf"] = "pdf";
    AgentName["Folder"] = "folder";
    AgentName["Verification"] = "verification";
    AgentName["Monitoring"] = "monitoring";
    AgentName["Notification"] = "notification";
    AgentName["Quality"] = "quality";
    AgentName["Learning"] = "learning";
})(AgentName || (exports.AgentName = AgentName = {}));
const agentToken = (name) => `AGENT_${name}`;
exports.agentToken = agentToken;
//# sourceMappingURL=agent-name.enum.js.map