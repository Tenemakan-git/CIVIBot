import { IAgent } from '../../../core/agent/agent.interface';
import { IntentResultDto } from '../dto/intent-result.dto';

/**
 * Contrat de l'Intent Analysis Agent : analyse le message et renvoie une
 * structure JSON stricte (jamais de texte libre).
 */
export interface IIntentAnalysisAgent extends IAgent<IntentResultDto> {}
