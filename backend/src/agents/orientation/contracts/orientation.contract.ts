import { IAgent } from '../../../core/agent/agent.interface';
import { OrientationDto } from '../dto/orientation.dto';

/**
 * Contrat de l'Orientation Agent : identifie, selon le domaine de l'intention,
 * les services administratifs compétents où l'utilisateur devra se rendre.
 */
export interface IOrientationAgent extends IAgent<OrientationDto> {}
