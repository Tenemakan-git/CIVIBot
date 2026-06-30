export declare const LLM_PROVIDER: unique symbol;
export interface LlmMessage {
    role: 'user' | 'assistant';
    content: string;
}
export type LlmTier = 'reasoning' | 'generation';
export interface LlmCompletionOptions {
    model?: string;
    tier?: LlmTier;
    system?: string;
    maxTokens?: number;
    temperature?: number;
    messages: LlmMessage[];
}
export interface LlmCompletionResult {
    text: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
}
export interface LlmStreamHandlers {
    onText: (text: string) => void;
}
export interface ILlmProvider {
    complete(options: LlmCompletionOptions): Promise<LlmCompletionResult>;
    completeJson<T>(options: LlmCompletionOptions): Promise<T>;
    stream(options: LlmCompletionOptions, handlers: LlmStreamHandlers): Promise<LlmCompletionResult>;
}
