export declare enum AgentName {
    Conversation = "conversation",
    IntentAnalysis = "intent-analysis",
    Planning = "planning",
    Knowledge = "knowledge",
    WebResearch = "web-research",
    KnowledgeValidation = "knowledge-validation",
    KnowledgeManager = "knowledge-manager",
    Procedure = "procedure",
    Checklist = "checklist",
    Document = "document",
    OfficialDocument = "official-document",
    Orientation = "orientation",
    Pdf = "pdf",
    Folder = "folder",
    Verification = "verification",
    Monitoring = "monitoring",
    Notification = "notification",
    Quality = "quality",
    Learning = "learning"
}
export declare const agentToken: (name: AgentName) => string;
