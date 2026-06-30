import { Domain } from '../../../core/agent/domain.enum';
export declare class CreateFolderDto {
    domaine: Domain;
    titre: string;
    procedureSlug?: string;
    conversationId?: string;
}
