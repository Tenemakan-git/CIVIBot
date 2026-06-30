import { Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext, readOutput } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { FolderService } from '../../folders/application/folder.service';
import { RequiredDocsChecklistService } from '../../folders/application/required-docs-checklist.service';
import { FolderDocumentInput } from '../../folders/domain/folder.repository.port';
import { IFolderAgent } from './contracts/folder.contract';
import { FolderSnapshotDto } from './dto/folder-io.dto';

// Formes lâches lues depuis ctx.outputs (les DTOs concrets arrivent aux
// étapes des agents Planning/Procedure/Document — lecture défensive ici).
interface PlanningData {
  steps?: unknown;
  estimatedCost?: string | null;
  estimatedDurationDays?: number | null;
}
interface ProcedureData {
  requiredDocuments?: {
    nom: string;
    obligatoire?: boolean;
    remarque?: string;
  }[];
}
interface DocumentData {
  documents?: { nom: string; statut?: string }[];
}

/**
 * Folder Agent — construit/assemble l'AdministrativeFolder à partir du contexte.
 * Le dossier (ctx.folderId) est déjà créé par l'orchestration ; cet agent y
 * agrège plan, documents et sources, puis recalcule la progression.
 */
@Injectable()
export class FolderAgent extends BaseAgent<FolderSnapshotDto> implements IFolderAgent {
  readonly name = AgentName.Folder;

  constructor(
    private readonly folders: FolderService,
    private readonly requiredDocs: RequiredDocsChecklistService,
  ) {
    super();
  }

  protected async run(ctx: AgentContext): Promise<AgentRunOutput<FolderSnapshotDto>> {
    const folderId = ctx.folderId;

    // 1) Plan (depuis Planning Agent)
    const planning = readOutput<PlanningData>(ctx, AgentName.Planning);
    if (planning?.status === 'success' && planning.data?.steps) {
      await this.folders.recordPlan(folderId, {
        steps: planning.data.steps,
        cout: planning.data.estimatedCost ?? null,
        delai: planning.data.estimatedDurationDays
          ? `${planning.data.estimatedDurationDays} jours`
          : null,
      });
    }

    // 2) Documents (depuis Procedure + Document Agents)
    const docs = this.collectDocuments(ctx);
    if (docs.length > 0) {
      await this.folders.recordDocuments(folderId, docs);
      // Checklist déterministe « Documents à fournir » miroir des pièces.
      await this.requiredDocs.sync(folderId);
    }

    // 3) Sources officielles citées par n'importe quel agent
    const sources = this.collectSources(ctx);
    if (sources.length > 0) await this.folders.recordSources(folderId, sources);

    // 4) Trace + recalcul progression
    await this.folders.recordTimeline(folderId, {
      type: 'agent_step',
      label: 'Dossier assemblé par le Folder Agent',
    });
    await this.folders.recordHistory(folderId, {
      action: 'dossier_assemble',
      acteur: this.name,
      payload: { documents: docs.length, plan: !!planning },
    });
    const folder = await this.folders.recomputeProgress(folderId);

    return {
      data: {
        folderId: folder.id,
        titre: folder.titre,
        domaine: folder.domaine,
        statut: folder.statut,
        progression: folder.progression,
        documentsCount: docs.length,
        hasPlan: !!planning?.data?.steps,
      },
      confidence: 1,
    };
  }

  private collectDocuments(ctx: AgentContext): FolderDocumentInput[] {
    const out: FolderDocumentInput[] = [];
    const seen = new Set<string>();
    const push = (nom: string, obligatoire = true, statut = 'manquant') => {
      const key = nom.trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push({ nom: nom.trim(), obligatoire, statut });
    };

    const procedure = readOutput<ProcedureData>(ctx, AgentName.Procedure);
    procedure?.data?.requiredDocuments?.forEach((d) =>
      push(d.nom, d.obligatoire ?? true),
    );

    const document = readOutput<DocumentData>(ctx, AgentName.Document);
    document?.data?.documents?.forEach((d) =>
      push(d.nom, true, d.statut ?? 'manquant'),
    );

    return out;
  }

  private collectSources(ctx: AgentContext) {
    const sources: { organisme: string; url?: string | null; titre?: string | null }[] = [];
    const seen = new Set<string>();
    for (const result of Object.values(ctx.outputs)) {
      result?.sources?.forEach((s) => {
        const key = `${s.organisme}|${s.url ?? ''}`;
        if (seen.has(key)) return;
        seen.add(key);
        sources.push({ organisme: s.organisme, url: s.url ?? null, titre: s.titre ?? null });
      });
    }
    return sources;
  }
}
