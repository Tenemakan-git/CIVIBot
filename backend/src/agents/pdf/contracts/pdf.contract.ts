import { IAgent } from '../../../core/agent/agent.interface';
import { PdfArtifactDto } from '../dto/pdf-artifact.dto';

/** Contrat du PDF Agent : génère le PDF du dossier administratif. */
export interface IPdfAgent extends IAgent<PdfArtifactDto> {}
