import { Inject, Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import {
  intentSummary,
  knowledgeContext,
} from '../../core/agent/context-helpers';
import { LLM_PROVIDER } from '../../core/ports/llm.port';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { IPlanningAgent } from './contracts/planning.contract';
import { PlanDto, PlanStepDto } from './dto/plan.dto';

/** Planning Agent — construit le plan (étapes, durée, coût, dépendances). */
@Injectable()
export class PlanningAgent
  extends BaseAgent<PlanDto>
  implements IPlanningAgent
{
  readonly name = AgentName.Planning;

  private readonly system = [
    "Tu es l'agent de planification de CiviBot (Côte d'Ivoire).",
    'À partir de la demande et du contexte documentaire, construis le plan de la démarche.',
    'Renvoie UNIQUEMENT un JSON:',
    '{',
    '  "steps": [{ "ordre": number, "titre": string, "description": string, "dependsOn": number[] }],',
    '  "estimatedDurationDays": number | null,',
    '  "estimatedCost": string | null,   // ex: "5 000 FCFA"',
    '  "dependencies": string[]',
    '}',
    'Base-toi sur le contexte fourni. Pas de texte hors JSON.',
  ].join('\n');

  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {
    super();
  }

  protected async run(ctx: AgentContext): Promise<AgentRunOutput<PlanDto>> {
    const raw = await this.llm.completeJson<Partial<PlanDto>>({
      tier: 'generation',
      system: this.system,
      messages: [
        {
          role: 'user',
          content: `${intentSummary(ctx)}\n\nContexte:\n${knowledgeContext(ctx) || '(aucun)'}`,
        },
      ],
    });

    const steps: PlanStepDto[] = Array.isArray(raw.steps)
      ? raw.steps.map((s, i) => ({
          ordre: typeof s?.ordre === 'number' ? s.ordre : i + 1,
          titre: String(s?.titre ?? `Étape ${i + 1}`),
          description: String(s?.description ?? ''),
          dependsOn: Array.isArray(s?.dependsOn) ? s.dependsOn : [],
        }))
      : [];

    return {
      data: {
        steps,
        estimatedDurationDays:
          typeof raw.estimatedDurationDays === 'number'
            ? raw.estimatedDurationDays
            : null,
        estimatedCost:
          typeof raw.estimatedCost === 'string' ? raw.estimatedCost : null,
        dependencies: Array.isArray(raw.dependencies)
          ? raw.dependencies.filter((d) => typeof d === 'string')
          : [],
      },
      confidence: steps.length > 0 ? 0.85 : 0.4,
      status: steps.length > 0 ? 'success' : 'partial',
    };
  }
}
