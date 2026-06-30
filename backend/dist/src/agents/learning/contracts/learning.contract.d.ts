export interface ILearningAgent {
    onFolderCreated(payload: unknown): Promise<void>;
}
