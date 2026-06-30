import { IAgent } from '../../../core/agent/agent.interface';
import { OfficialDocSuggestionDto } from '../dto/official-doc-suggestion.dto';

/**
 * Contrat de l'Official Document Agent : suggère, selon le domaine/la procédure,
 * les documents officiels que l'utilisateur peut faire pré-remplir. La
 * génération elle-même reste déclenchée à la demande (REST), pas automatique.
 */
export interface IOfficialDocAgent extends IAgent<OfficialDocSuggestionDto> {}
