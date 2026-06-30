import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { FolderService } from '../../folders/application/folder.service';
import { IVerificationAgent } from './contracts/verification.contract';
import { VerificationReportDto } from './dto/verification-report.dto';
export declare class VerificationAgent extends BaseAgent<VerificationReportDto> implements IVerificationAgent {
    private readonly folders;
    private readonly events;
    readonly name = AgentName.Verification;
    constructor(folders: FolderService, events: EventEmitter2);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<VerificationReportDto>>;
}
