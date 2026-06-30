import { IAgent } from '../../../core/agent/agent.interface';
import { VerificationReportDto } from '../dto/verification-report.dto';
export interface IVerificationAgent extends IAgent<VerificationReportDto> {
}
