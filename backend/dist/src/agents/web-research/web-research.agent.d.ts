import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { IWebResearchAgent } from './contracts/web-research.contract';
import { WebResearchResultDto } from './dto/web-research.dto';
import { IngestionPipeline } from './pipeline/ingestion-pipeline';
export declare class WebResearchAgent extends BaseAgent<WebResearchResultDto> implements IWebResearchAgent {
    private readonly pipeline;
    private readonly events;
    readonly name = AgentName.WebResearch;
    constructor(pipeline: IngestionPipeline, events: EventEmitter2);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<WebResearchResultDto>>;
}
