import { Domain } from '../../core/agent/domain.enum';
import { FolderStatus } from './folder-status.vo';
export interface FolderSnapshot {
    id: string;
    userId: string;
    domaine: string;
    procedureSlug: string | null;
    titre: string;
    statut: string;
    progression: number;
    conversationId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateFolderProps {
    id?: string;
    userId: string;
    domaine: Domain;
    titre: string;
    procedureSlug?: string | null;
    conversationId?: string | null;
}
export declare class AdministrativeFolder {
    readonly id: string;
    readonly userId: string;
    private _domaine;
    private _titre;
    private _procedureSlug;
    private _statut;
    private _progression;
    private _conversationId;
    readonly createdAt: Date;
    private _updatedAt;
    private constructor();
    static create(props: CreateFolderProps): AdministrativeFolder;
    static fromSnapshot(s: FolderSnapshot): AdministrativeFolder;
    get domaine(): Domain;
    get titre(): string;
    get procedureSlug(): string | null;
    get statut(): FolderStatus;
    get progression(): number;
    get conversationId(): string | null;
    get updatedAt(): Date;
    rename(titre: string): void;
    attachConversation(conversationId: string): void;
    setProcedure(slug: string): void;
    updateProgress(value: number): void;
    terminate(): void;
    transitionTo(status: FolderStatus): void;
    private touch;
    toSnapshot(): FolderSnapshot;
}
