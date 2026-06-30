import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { Events } from '../../core/events/event-names';
import { FolderService } from '../../folders/application/folder.service';
import { IVerificationAgent } from './contracts/verification.contract';
import { VerificationReportDto } from './dto/verification-report.dto';

/**
 * Verification Agent — analyse l'état réel du dossier (source de vérité) :
 * complet/incomplet, pièces manquantes, recommandations. Déterministe (pas
 * d'hallucination possible), émet `verification.completed`.
 */
@Injectable()
export class VerificationAgent
  extends BaseAgent<VerificationReportDto>
  implements IVerificationAgent
{
  readonly name = AgentName.Verification;

  constructor(
    private readonly folders: FolderService,
    private readonly events: EventEmitter2,
  ) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<VerificationReportDto>> {
    const view = await this.folders.getView(ctx.folderId, ctx.userId);

    const missing = view.documents
      .filter((d) => d.obligatoire !== false && d.statut !== 'fourni')
      .map((d) => d.nom);

    const hasDocs = view.documents.length > 0;
    const status: VerificationReportDto['status'] =
      hasDocs && missing.length === 0 ? 'complet' : 'incomplet';

    const recommendations: string[] = [];
    if (!hasDocs) {
      recommendations.push(
        'Aucun document listé : précisez la démarche pour générer la liste des pièces.',
      );
    }
    for (const nom of missing) {
      recommendations.push(`Fournir la pièce obligatoire manquante : ${nom}.`);
    }
    if (status === 'complet') {
      recommendations.push('Dossier complet : vous pouvez déposer votre demande.');
    }

    const report: VerificationReportDto = { status, missing, recommendations };

    this.events.emit(Events.Verification.Completed, {
      folderId: ctx.folderId,
      userId: ctx.userId,
      domaine: ctx.intent?.domain ?? null,
      status,
      missing,
      missingCount: missing.length,
    });

    return {
      data: report,
      confidence: 1, // déterministe
      status: status === 'incomplet' ? 'partial' : 'success',
    };
  }
}
