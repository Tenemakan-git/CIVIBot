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
import { IProcedureAgent } from './contracts/procedure.contract';
import {
  ProcedureDto,
  ProcedureRequiredDocumentDto,
  ProcedureStepDto,
} from './dto/procedure.dto';

/** Procedure Agent — étapes, documents requis, contraintes, conseils. */
@Injectable()
export class ProcedureAgent
  extends BaseAgent<ProcedureDto>
  implements IProcedureAgent
{
  readonly name = AgentName.Procedure;

  private readonly system = [
    "Tu es l'agent de procédure de CiviBot (Côte d'Ivoire).",
    'Construis la procédure personnalisée. Renvoie UNIQUEMENT un JSON:',
    '{',
    '  "titre": string,',
    '  "steps": [{ "ordre": number, "titre": string, "description": string }],',
    '  "requiredDocuments": [{ "nom": string, "obligatoire": boolean, "remarque": string }],',
    '  "constraints": string[],',
    '  "tips": string[]',
    '}',
    "Appuie-toi sur le contexte officiel fourni. N'invente pas de documents.",
  ].join('\n');

  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {
    super();
  }

  protected async run(ctx: AgentContext): Promise<AgentRunOutput<ProcedureDto>> {
    const raw = await this.llm.completeJson<Partial<ProcedureDto>>({
      tier: 'generation',
      system: this.system,
      messages: [
        {
          role: 'user',
          content: `${intentSummary(ctx)}\n\nContexte:\n${knowledgeContext(ctx) || '(aucun)'}`,
        },
      ],
    });

    const steps: ProcedureStepDto[] = Array.isArray(raw.steps)
      ? raw.steps.map((s, i) => ({
          ordre: typeof s?.ordre === 'number' ? s.ordre : i + 1,
          titre: String(s?.titre ?? `Étape ${i + 1}`),
          description: String(s?.description ?? ''),
        }))
      : [];

    const requiredDocuments: ProcedureRequiredDocumentDto[] = Array.isArray(
      raw.requiredDocuments,
    )
      ? raw.requiredDocuments
          .filter((d) => d && typeof d.nom === 'string')
          .map((d) => ({
            nom: d.nom,
            obligatoire: d.obligatoire !== false,
            remarque: typeof d.remarque === 'string' ? d.remarque : undefined,
          }))
      : [];

    return {
      data: {
        titre: typeof raw.titre === 'string' ? raw.titre : ctx.intent?.intent ?? 'Procédure',
        steps,
        requiredDocuments,
        constraints: this.strings(raw.constraints),
        tips: this.strings(raw.tips),
      },
      confidence: steps.length > 0 ? 0.85 : 0.4,
      status: steps.length > 0 ? 'success' : 'partial',
    };
  }

  private strings(v: unknown): string[] {
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  }
}
