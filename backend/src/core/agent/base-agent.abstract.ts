import { Logger } from '@nestjs/common';
import { AgentName } from './agent-name.enum';
import { AgentContext } from './agent-context';
import { AgentResult, AgentRunOutput } from './agent-result';
import { IAgent } from './agent.interface';

/**
 * Base commune des agents : factorise mesure du temps, gestion d'erreur
 * (toute exception => `status: 'failed'` sans casser le workflow) et valeurs
 * par défaut. Chaque agent concret n'implémente que `run()`.
 */
export abstract class BaseAgent<TOut = unknown> implements IAgent<TOut> {
  abstract readonly name: AgentName;
  protected readonly logger = new Logger(this.constructor.name);

  /** Logique métier propre à l'agent. */
  protected abstract run(ctx: AgentContext): Promise<AgentRunOutput<TOut>>;

  async execute(ctx: AgentContext): Promise<AgentResult<TOut>> {
    const start = Date.now();
    try {
      const out = await this.run(ctx);
      return {
        agent: this.name,
        status: out.status ?? 'success',
        data: out.data,
        confidence: out.confidence ?? 1,
        followups: out.followups,
        sources: out.sources,
        warnings: out.warnings,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Agent "${this.name}" a échoué: ${error.message}`,
        error.stack,
      );
      return {
        agent: this.name,
        status: 'failed',
        data: undefined as unknown as TOut,
        confidence: 0,
        errors: [error.message],
        durationMs: Date.now() - start,
      };
    }
  }
}
