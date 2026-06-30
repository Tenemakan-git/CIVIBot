import { Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext, readOutput } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { IPdfAgent } from './contracts/pdf.contract';
import { PdfArtifactDto } from './dto/pdf-artifact.dto';
import { PdfService } from './pdf.service';

/**
 * PDF Agent — génère le PDF du dossier. Orchestrable (via followup) ou invoqué
 * à la demande par le controller. Récupère les conseils éventuels produits par
 * le Procedure Agent dans le contexte.
 */
@Injectable()
export class PdfAgent extends BaseAgent<PdfArtifactDto> implements IPdfAgent {
  readonly name = AgentName.Pdf;

  constructor(private readonly pdf: PdfService) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<PdfArtifactDto>> {
    const proc = readOutput<{ tips?: string[] }>(ctx, AgentName.Procedure);
    const tips = Array.isArray(proc?.data?.tips) ? proc!.data!.tips! : [];

    const rendered = await this.pdf.generate(ctx.folderId, ctx.userId, tips);
    return {
      data: {
        storageKey: rendered.storageKey,
        filename: rendered.filename,
        bytes: rendered.bytes,
      },
      confidence: 1,
    };
  }
}
