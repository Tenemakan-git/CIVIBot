import { Module } from '@nestjs/common';
import { AgentName, agentToken } from '../../core/agent/agent-name.enum';
import { WebResearchAgent } from './web-research.agent';
import { IngestionPipeline } from './pipeline/ingestion-pipeline';
import { SearchStage } from './pipeline/search.stage';
import { ExtractStage } from './pipeline/extract.stage';
import { CleanStage } from './pipeline/clean.stage';
import { DedupStage } from './pipeline/dedup.stage';

@Module({
  providers: [
    SearchStage,
    ExtractStage,
    CleanStage,
    DedupStage,
    IngestionPipeline,
    WebResearchAgent,
    { provide: agentToken(AgentName.WebResearch), useExisting: WebResearchAgent },
  ],
  exports: [WebResearchAgent, agentToken(AgentName.WebResearch)],
})
export class WebResearchAgentModule {}
