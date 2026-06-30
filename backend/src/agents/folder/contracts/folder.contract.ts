import { IAgent } from '../../../core/agent/agent.interface';
import { FolderSnapshotDto } from '../dto/folder-io.dto';

/**
 * Contrat du Folder Agent : assemble le dossier administratif (entité
 * principale) à partir des sorties des agents précédents présentes dans le
 * contexte. Ne dépend d'aucun autre agent (lit `ctx.outputs`).
 */
export interface IFolderAgent extends IAgent<FolderSnapshotDto> {}
