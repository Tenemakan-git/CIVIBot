import { PrismaService } from '../../prisma/prisma.service';
import { ILlmProvider, LlmCompletionOptions, LlmCompletionResult, LlmStreamHandlers } from '../../core/ports/llm.port';
export declare class AnthropicAdapter implements ILlmProvider {
    private readonly prisma;
    private readonly logger;
    private readonly claude;
    private readonly gemini;
    private readonly models;
    constructor(prisma: PrismaService);
    private defaults;
    private resolveModel;
    private samplingParams;
    complete(options: LlmCompletionOptions): Promise<LlmCompletionResult>;
    completeJson<T>(options: LlmCompletionOptions): Promise<T>;
    stream(options: LlmCompletionOptions, handlers: LlmStreamHandlers): Promise<LlmCompletionResult>;
    private streamWithClaude;
    private completeWithGemini;
    private streamWithGemini;
    private toGeminiHistory;
    private parseJson;
}
