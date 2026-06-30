import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { IDocumentAgent } from './contracts/document.contract';
import { DocumentBundleDto } from './dto/document-bundle.dto';
export declare class DocumentAgent extends BaseAgent<DocumentBundleDto> implements IDocumentAgent {
    private readonly llm;
    readonly name = AgentName.Document;
    private readonly system;
    constructor(llm: ILlmProvider);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<DocumentBundleDto>>;
}
