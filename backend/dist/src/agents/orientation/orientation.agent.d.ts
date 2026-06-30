import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { ServiceDirectoryService } from '../../services-directory/service-directory.service';
import { IOrientationAgent } from './contracts/orientation.contract';
import { OrientationDto } from './dto/orientation.dto';
export declare class OrientationAgent extends BaseAgent<OrientationDto> implements IOrientationAgent {
    private readonly directory;
    readonly name = AgentName.Orientation;
    constructor(directory: ServiceDirectoryService);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<OrientationDto>>;
}
