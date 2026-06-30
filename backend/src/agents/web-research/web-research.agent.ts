import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput, SourceRef } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { Events } from '../../core/events/event-names';
import { IWebResearchAgent } from './contracts/web-research.contract';
import { WebResearchResultDto } from './dto/web-research.dto';
import { IngestionPipeline } from './pipeline/ingestion-pipeline';

/**
 * Web Research Agent — déclenché par le Knowledge Agent (followup) quand la
 * connaissance locale est insuffisante. Exécute le pipeline d'ingestion et met
 * les candidats en staging, puis réclame la validation.
 */
@Injectable()
export class WebResearchAgent
  extends BaseAgent<WebResearchResultDto>
  implements IWebResearchAgent
{
  readonly name = AgentName.WebResearch;

  constructor(
    private readonly pipeline: IngestionPipeline,
    private readonly events: EventEmitter2,
  ) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<WebResearchResultDto>> {
    // Marque l'enrichissement pour empêcher une seconde boucle de recherche.
    ctx.metadata['webResearchDone'] = true;

    const candidates = await this.pipeline.run(ctx.userMessage);

    if (candidates.length > 0) {
      this.events.emit(Events.Knowledge.CandidatesReady, {
        folderId: ctx.folderId,
        count: candidates.length,
      });
    }

    const sources: SourceRef[] = candidates.map((c) => ({
      organisme: c.organisme,
      url: c.sourceUrl,
      titre: c.titre,
    }));

    return {
      data: { candidates },
      confidence: candidates.length > 0 ? 0.7 : 0.2,
      status: candidates.length > 0 ? 'success' : 'partial',
      followups: candidates.length > 0 ? [AgentName.KnowledgeValidation] : [],
      sources,
    };
  }
}
