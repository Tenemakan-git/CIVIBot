import { IAgent } from '../../../core/agent/agent.interface';
import { DocumentBundleDto } from '../dto/document-bundle.dto';

/** Contrat du Document Agent : construit le dossier documentaire. */
export interface IDocumentAgent extends IAgent<DocumentBundleDto> {}
