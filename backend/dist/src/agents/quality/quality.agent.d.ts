import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { IQualityAgent } from './contracts/quality.contract';
import { QualityVerdictDto } from './dto/quality-verdict.dto';
export declare class QualityAgent extends BaseAgent<QualityVerdictDto> implements IQualityAgent {
    private readonly events;
    readonly name = AgentName.Quality;
    constructor(events: EventEmitter2);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<QualityVerdictDto>>;
    private avgConfidence;
    private knowledgeSignals;
    private countSources;
    private round;
}
