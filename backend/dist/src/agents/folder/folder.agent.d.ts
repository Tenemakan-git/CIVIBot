import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { FolderService } from '../../folders/application/folder.service';
import { RequiredDocsChecklistService } from '../../folders/application/required-docs-checklist.service';
import { IFolderAgent } from './contracts/folder.contract';
import { FolderSnapshotDto } from './dto/folder-io.dto';
export declare class FolderAgent extends BaseAgent<FolderSnapshotDto> implements IFolderAgent {
    private readonly folders;
    private readonly requiredDocs;
    readonly name = AgentName.Folder;
    constructor(folders: FolderService, requiredDocs: RequiredDocsChecklistService);
    protected run(ctx: AgentContext): Promise<AgentRunOutput<FolderSnapshotDto>>;
    private collectDocuments;
    private collectSources;
}
