import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext, readOutput } from '../../core/agent/agent-context';
import { AgentResult, AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { Events } from '../../core/events/event-names';
import { IQualityAgent } from './contracts/quality.contract';
import { QualityVerdictDto } from './dto/quality-verdict.dto';

const HALLUCINATION_MAX = 0.6;
const CONFIDENCE_MIN = 0.4;

/**
 * Quality Agent — dernière étape du pipeline, AVANT la synthèse. Score les
 * preuves assemblées (sans appel LLM, donc fiable et non hallucinant) :
 * confiance moyenne des agents, suffisance/qualité des sources, cohérence
 * d'intention. Le Conversation Agent lit ce verdict pour adapter la synthèse
 * (mode prudent + avertissement) — la réponse est donc générée correctement du
 * premier coup plutôt que régénérée.
 */
@Injectable()
export class QualityAgent
  extends BaseAgent<QualityVerdictDto>
  implements IQualityAgent
{
  readonly name = AgentName.Quality;

  constructor(private readonly events: EventEmitter2) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<QualityVerdictDto>> {
    const confidence = this.avgConfidence(ctx);
    const { sufficient, bestScore, chunkCount } = this.knowledgeSignals(ctx);
    const sourceCount = this.countSources(ctx);

    // Qualité des sources : présence + pertinence (score pgvector) + volume.
    const sourceQuality = Math.min(
      1,
      (Math.min(sourceCount, 3) / 3) * 0.5 + bestScore * 0.5,
    );

    // Cohérence : compréhension de l'intention pondérée par la suffisance.
    const intentConfidence = ctx.intent?.confidence ?? 0.5;
    const coherence = intentConfidence * (sufficient ? 1 : 0.6);

    // Risque d'hallucination : élevé si peu/pas d'ancrage documentaire.
    const grounding = chunkCount > 0 ? bestScore : 0;
    const hallucinationRisk = Math.max(0, 1 - grounding);

    const passed =
      hallucinationRisk <= HALLUCINATION_MAX && confidence >= CONFIDENCE_MIN;

    const notes: string[] = [];
    if (!sufficient)
      notes.push('Ancrage documentaire faible : répondre avec prudence.');
    if (sourceCount === 0) notes.push('Aucune source citable.');
    if (confidence < CONFIDENCE_MIN)
      notes.push('Confiance globale des agents faible.');

    const verdict: QualityVerdictDto = {
      passed,
      hallucinationRisk: this.round(hallucinationRisk),
      confidence: this.round(confidence),
      coherence: this.round(coherence),
      sourceQuality: this.round(sourceQuality),
      notes,
    };

    if (!passed) {
      this.events.emit(Events.Quality.Failed, {
        folderId: ctx.folderId,
        verdict,
      });
    }

    return {
      data: verdict,
      confidence,
      status: passed ? 'success' : 'partial',
    };
  }

  private avgConfidence(ctx: AgentContext): number {
    const results = Object.values(ctx.outputs).filter(
      (r): r is AgentResult => !!r && r.agent !== AgentName.Quality,
    );
    if (results.length === 0) return 0.5;
    const sum = results.reduce((acc, r) => acc + (r.confidence ?? 0), 0);
    return sum / results.length;
  }

  private knowledgeSignals(ctx: AgentContext): {
    sufficient: boolean;
    bestScore: number;
    chunkCount: number;
  } {
    const k = readOutput<{
      sufficient?: boolean;
      chunks?: { score: number }[];
    }>(ctx, AgentName.Knowledge);
    const chunks = k?.data?.chunks ?? [];
    return {
      sufficient: k?.data?.sufficient ?? false,
      bestScore: chunks[0]?.score ?? 0,
      chunkCount: chunks.length,
    };
  }

  private countSources(ctx: AgentContext): number {
    const keys = new Set<string>();
    for (const r of Object.values(ctx.outputs)) {
      r?.sources?.forEach((s) => keys.add(`${s.organisme}|${s.url ?? ''}`));
    }
    return keys.size;
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
