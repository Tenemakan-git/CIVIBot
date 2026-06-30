import { IAgent } from '../../../core/agent/agent.interface';
import { WebResearchResultDto } from '../dto/web-research.dto';

/**
 * Contrat du Web Research Agent : recherche sur sources officielles et met les
 * résultats en staging. Le résultat n'est jamais injecté directement dans la
 * base documentaire.
 */
export interface IWebResearchAgent extends IAgent<WebResearchResultDto> {}
