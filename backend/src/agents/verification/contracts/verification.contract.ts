import { IAgent } from '../../../core/agent/agent.interface';
import { VerificationReportDto } from '../dto/verification-report.dto';

/** Contrat du Verification Agent : analyse la complétude du dossier. */
export interface IVerificationAgent extends IAgent<VerificationReportDto> {}
