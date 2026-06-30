import { Inject, Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { Domain } from '../../core/agent/domain.enum';
import { LLM_PROVIDER } from '../../core/ports/llm.port';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { IIntentAnalysisAgent } from './contracts/intent.contract';
import { IntentResultDto } from './dto/intent-result.dto';

/**
 * Intent Analysis Agent — classe le message dans un domaine/procédure et
 * renvoie un JSON strict (tier "reasoning" = Opus). Aucune décision
 * d'orchestration : il se contente d'analyser.
 */
@Injectable()
export class IntentAnalysisAgent
  extends BaseAgent<IntentResultDto>
  implements IIntentAnalysisAgent
{
  readonly name = AgentName.IntentAnalysis;

  private readonly system = [
    "Tu es l'agent d'analyse d'intention de CiviBot (assistance administrative, Côte d'Ivoire).",
    'Domaines possibles: "etat_civil" ou "creation_entreprise".',
    'Analyse le message utilisateur et renvoie UNIQUEMENT un objet JSON avec EXACTEMENT ces clés:',
    '{',
    '  "intent": string,            // identifiant court, ex: "obtenir_acte_naissance"',
    '  "domain": "etat_civil" | "creation_entreprise",',
    '  "procedure": string | null,  // slug de procédure si identifiable, sinon null',
    '  "confidence": number,        // 0..1',
    '  "priority": "low" | "normal" | "high",',
    '  "detectedNeeds": string[],   // besoins concrets détectés',
    '  "actions": string[]          // sous-ensemble de: ' +
      Object.values(AgentName).join(', '),
    '}',
    'Pas de texte hors du JSON, pas de markdown.',
  ].join('\n');

  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<IntentResultDto>> {
    const raw = await this.llm.completeJson<Partial<IntentResultDto>>({
      tier: 'reasoning',
      system: this.system,
      messages: [{ role: 'user', content: ctx.userMessage }],
    });

    const data = this.normalize(raw);
    return {
      data,
      confidence: data.confidence,
      // confiance faible => résultat partiel (le Quality Agent pourra réagir)
      status: data.confidence < 0.4 ? 'partial' : 'success',
    };
  }

  /** Garde-fou : borne/normalise la sortie LLM avant de la propager. */
  private normalize(raw: Partial<IntentResultDto>): IntentResultDto {
    const domain = Object.values(Domain).includes(raw.domain as Domain)
      ? (raw.domain as Domain)
      : Domain.EtatCivil;
    const allowedActions = new Set<string>(Object.values(AgentName));
    const actions = Array.isArray(raw.actions)
      ? (raw.actions.filter((a) => allowedActions.has(a)) as AgentName[])
      : [];
    const priority =
      raw.priority === 'low' || raw.priority === 'high'
        ? raw.priority
        : 'normal';

    return {
      intent: typeof raw.intent === 'string' ? raw.intent : 'inconnu',
      domain,
      procedure: typeof raw.procedure === 'string' ? raw.procedure : null,
      confidence:
        typeof raw.confidence === 'number'
          ? Math.max(0, Math.min(1, raw.confidence))
          : 0.5,
      priority,
      detectedNeeds: Array.isArray(raw.detectedNeeds)
        ? raw.detectedNeeds.filter((n) => typeof n === 'string')
        : [],
      actions,
    };
  }
}
