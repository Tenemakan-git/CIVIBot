import { IAgent } from '../../../core/agent/agent.interface';
import { KnowledgeAnswerDto } from '../dto/knowledge-io.dto';

/**
 * Contrat du Knowledge Agent : interroge PostgreSQL + pgvector. Si les
 * informations locales sont insuffisantes, il le signale via
 * `result.followups = [WebResearch]` (jamais d'appel direct).
 */
export interface IKnowledgeAgent extends IAgent<KnowledgeAnswerDto> {}
