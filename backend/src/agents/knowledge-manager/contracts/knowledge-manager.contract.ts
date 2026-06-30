import { IAgent } from '../../../core/agent/agent.interface';
import { KnowledgeCommitDto } from '../dto/knowledge-commit.dto';

/**
 * Contrat du Knowledge Manager Agent : crée les embeddings, met à jour pgvector
 * et versionne les documents validés.
 */
export interface IKnowledgeManagerAgent extends IAgent<KnowledgeCommitDto> {}
