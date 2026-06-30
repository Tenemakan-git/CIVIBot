import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { IPdfAgent } from './contracts/pdf.contract';
import { PdfArtifactDto } from './dto/pdf-artifact.dto';
import { PdfService } from './pdf.service';
export declare class PdfAgent extends BaseAgent<PdfArtifactDto> implements IPdfAgent {
    private readonly pdf;
    readonly name = AgentName.Pdf;
    constructor(pdf: PdfService);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<PdfArtifactDto>>;
}
