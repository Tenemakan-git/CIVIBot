/** Token DI du fournisseur LLM (implémenté par AnthropicAdapter en infra). */
export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface LlmMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Rôle logique d'un appel, pour router le modèle (raisonnement vs génération). */
export type LlmTier = 'reasoning' | 'generation';

export interface LlmCompletionOptions {
  /** Modèle explicite ; sinon résolu via `tier` + AiSettings. */
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

/**
 * Abstraction du fournisseur LLM. Encapsule le SDK Anthropic et le repli
 * éventuel — aucun agent ne connaît le détail du provider.
 */
export interface ILlmProvider {
  complete(options: LlmCompletionOptions): Promise<LlmCompletionResult>;

  /**
   * Complétion en mode JSON strict : parse la sortie et la renvoie typée.
   * Lève si la réponse n'est pas un JSON valide (anti-texte-libre).
   */
  completeJson<T>(options: LlmCompletionOptions): Promise<T>;

  stream(
    options: LlmCompletionOptions,
    handlers: LlmStreamHandlers,
  ): Promise<LlmCompletionResult>;
}
