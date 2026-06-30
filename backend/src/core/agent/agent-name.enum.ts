/**
 * Registre central des agents du système CiviBot V2.
 * Sert d'identité unique pour la DI (token `AGENT_<NAME>`), le routage de
 * l'Orchestrator (AgentRegistry) et la traçabilité (AgentRun).
 */
export enum AgentName {
  Conversation = 'conversation',
  IntentAnalysis = 'intent-analysis',
  Planning = 'planning',
  Knowledge = 'knowledge',
  WebResearch = 'web-research',
  KnowledgeValidation = 'knowledge-validation',
  KnowledgeManager = 'knowledge-manager',
  Procedure = 'procedure',
  Checklist = 'checklist',
  Document = 'document',
  OfficialDocument = 'official-document',
  Orientation = 'orientation',
  Pdf = 'pdf',
  Folder = 'folder',
  Verification = 'verification',
  Monitoring = 'monitoring',
  Notification = 'notification',
  Quality = 'quality',
  Learning = 'learning',
}

/** Construit le token d'injection NestJS d'un agent. */
export const agentToken = (name: AgentName): string => `AGENT_${name}`;
