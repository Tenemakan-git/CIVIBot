import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ILlmProvider,
  LlmCompletionOptions,
  LlmCompletionResult,
  LlmMessage,
  LlmStreamHandlers,
  LlmTier,
} from '../../core/ports/llm.port';

/**
 * Adapter du port `ILlmProvider` (couche infrastructure).
 *
 * - Route le modèle selon le `tier` : `reasoning` => Opus (Orchestrator,
 *   Intent, Quality) ; `generation` => Sonnet (Checklist, Document…).
 * - Encapsule le repli Claude -> Gemini : aucun agent n'a connaissance du
 *   provider sous-jacent.
 * - Ne journalise PAS (AiLog/AgentRun = responsabilité de l'orchestration).
 */
@Injectable()
export class AnthropicAdapter implements ILlmProvider {
  private readonly logger = new Logger(AnthropicAdapter.name);
  private readonly claude = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  private readonly gemini = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || '',
  );

  private readonly models: Record<LlmTier, string> = {
    reasoning: process.env.ANTHROPIC_REASONING_MODEL || 'claude-opus-4-8',
    generation: process.env.ANTHROPIC_GENERATION_MODEL || 'claude-sonnet-4-6',
  };

  constructor(private readonly prisma: PrismaService) {}

  // ── Defaults (température, maxTokens, modèle de secours) depuis AiSettings ──
  private async defaults() {
    let settings = await this.prisma.aiSettings.findFirst();
    if (!settings) settings = await this.prisma.aiSettings.create({ data: {} });
    return {
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      fallbackModel: settings.modeleSecours || 'gemini-2.0-flash',
    };
  }

  private resolveModel(options: LlmCompletionOptions): string {
    if (options.model) return options.model;
    return this.models[options.tier ?? 'generation'];
  }

  /**
   * Opus 4.7/4.8 et Fable/Mythos 5 REJETTENT `temperature`/`top_p`/`top_k`
   * (HTTP 400). Envoyer `temperature` au modèle de raisonnement
   * (`claude-opus-4-8`) faisait échouer TOUS les appels Intent/Quality →
   * repli silencieux Gemini, voire `fallbackIntent` (= « Démarche etat civil »
   * pour tous les dossiers). On n'inclut donc le paramètre que pour les
   * modèles qui l'acceptent encore.
   */
  private samplingParams(
    model: string,
    temperature: number,
  ): { temperature?: number } {
    return /(opus-4-[78]|fable-5|mythos)/.test(model) ? {} : { temperature };
  }

  async complete(
    options: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    const { temperature, maxTokens, fallbackModel } = await this.defaults();
    const model = this.resolveModel(options);

    try {
      const msg = await this.claude.messages.create({
        model,
        max_tokens: options.maxTokens ?? maxTokens,
        ...this.samplingParams(model, options.temperature ?? temperature),
        system: options.system,
        messages: options.messages,
      });
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
      return {
        text,
        model,
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
      };
    } catch (err) {
      this.logger.warn(
        `Claude indisponible (${(err as Error).message}) → repli Gemini`,
      );
      return this.completeWithGemini(fallbackModel, options);
    }
  }

  async completeJson<T>(options: LlmCompletionOptions): Promise<T> {
    const jsonSystem = [
      options.system,
      'Réponds STRICTEMENT avec un JSON valide, sans texte ni balises markdown.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const { text } = await this.complete({ ...options, system: jsonSystem });
    return this.parseJson<T>(text);
  }

  async stream(
    options: LlmCompletionOptions,
    handlers: LlmStreamHandlers,
  ): Promise<LlmCompletionResult> {
    const { temperature, maxTokens, fallbackModel } = await this.defaults();
    const model = this.resolveModel(options);

    try {
      return await this.streamWithClaude(model, maxTokens, temperature, options, handlers);
    } catch (err) {
      this.logger.warn(
        `Claude stream indisponible (${(err as Error).message}) → repli Gemini`,
      );
      return this.streamWithGemini(fallbackModel, options, handlers);
    }
  }

  // ─────────────────────────── Claude ───────────────────────────
  private streamWithClaude(
    model: string,
    defaultMaxTokens: number,
    defaultTemperature: number,
    options: LlmCompletionOptions,
    handlers: LlmStreamHandlers,
  ): Promise<LlmCompletionResult> {
    return new Promise((resolve, reject) => {
      let text = '';
      const stream = this.claude.messages.stream({
        model,
        max_tokens: options.maxTokens ?? defaultMaxTokens,
        ...this.samplingParams(model, options.temperature ?? defaultTemperature),
        system: options.system,
        messages: options.messages,
      });

      stream.on('text', (chunk) => {
        text += chunk;
        handlers.onText(chunk);
      });
      stream.on('message', (msg) => {
        resolve({
          text,
          model,
          inputTokens: msg.usage.input_tokens,
          outputTokens: msg.usage.output_tokens,
        });
      });
      stream.on('error', (err) => reject(err));
    });
  }

  // ─────────────────────────── Gemini (repli) ───────────────────────────
  private async completeWithGemini(
    model: string,
    options: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Aucune IA disponible (Claude KO, GEMINI_API_KEY absente)');
    }
    const genModel = this.gemini.getGenerativeModel({
      model,
      systemInstruction: options.system,
    });
    const { history, last } = this.toGeminiHistory(options.messages);
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessage(last);
    return {
      text: result.response.text(),
      model,
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  private async streamWithGemini(
    model: string,
    options: LlmCompletionOptions,
    handlers: LlmStreamHandlers,
  ): Promise<LlmCompletionResult> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Aucune IA disponible (Claude KO, GEMINI_API_KEY absente)');
    }
    const genModel = this.gemini.getGenerativeModel({
      model,
      systemInstruction: options.system,
    });
    const { history, last } = this.toGeminiHistory(options.messages);
    const chat = genModel.startChat({ history });
    const result = await chat.sendMessageStream(last);

    let text = '';
    for await (const chunk of result.stream) {
      const t = chunk.text();
      if (t) {
        text += t;
        handlers.onText(t);
      }
    }
    return { text, model, inputTokens: 0, outputTokens: 0 };
  }

  private toGeminiHistory(messages: LlmMessage[]): {
    history: Content[];
    last: string;
  } {
    const history: Content[] = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    const last = messages[messages.length - 1]?.content ?? '';
    return { history, last };
  }

  // ─────────────────────────── Helpers ───────────────────────────
  private parseJson<T>(raw: string): T {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    // Isole le premier objet/tableau JSON pour tolérer un préambule éventuel.
    const start = cleaned.search(/[[{]/);
    const candidate = start >= 0 ? cleaned.slice(start) : cleaned;
    try {
      return JSON.parse(candidate) as T;
    } catch {
      throw new Error(
        `Sortie LLM non-JSON exploitable: "${raw.slice(0, 200)}"`,
      );
    }
  }
}
