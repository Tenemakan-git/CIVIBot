import { Inject, Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext, readOutput } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import {
  intentSummary,
  knowledgeContext,
} from '../../core/agent/context-helpers';
import { LLM_PROVIDER } from '../../core/ports/llm.port';
import type { ILlmProvider } from '../../core/ports/llm.port';
import { PrismaService } from '../../prisma/prisma.service';
import { IChecklistAgent } from './contracts/checklist.contract';
import { ChecklistDto, ChecklistItemDto } from './dto/checklist.dto';

/**
 * Checklist Agent — génère une checklist complète et la persiste, rattachée
 * au dossier (apparaît alors dans la vue du dossier).
 */
@Injectable()
export class ChecklistAgent
  extends BaseAgent<ChecklistDto>
  implements IChecklistAgent
{
  readonly name = AgentName.Checklist;

  private readonly system = [
    "Tu es l'agent de checklist de CiviBot (Côte d'Ivoire).",
    'Génère une checklist actionnable pour la démarche. Renvoie UNIQUEMENT un JSON:',
    '{',
    '  "titre": string,',
    '  "items": [{ "libelle": string, "obligatoire": boolean, "termine": false, "ordre": number }]',
    '}',
    "NE LISTE PAS les pièces/documents à fournir : ils sont suivis séparément.",
    "Concentre-toi sur les ACTIONS (prise de rendez-vous, paiements, déplacements,",
    'vérifications, dépôt du dossier). Items concrets et ordonnés. Pas de texte hors JSON.',
  ].join('\n');

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: ILlmProvider,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  protected async run(ctx: AgentContext): Promise<AgentRunOutput<ChecklistDto>> {
    const raw = await this.llm.completeJson<Partial<ChecklistDto>>({
      tier: 'generation',
      system: this.system,
      messages: [
        {
          role: 'user',
          content: `${intentSummary(ctx)}\n\nContexte:\n${knowledgeContext(ctx) || '(aucun)'}`,
        },
      ],
    });

    const rawItems: ChecklistItemDto[] = Array.isArray(raw.items)
      ? raw.items.map((it, i) => ({
          libelle: String(it?.libelle ?? `Élément ${i + 1}`),
          obligatoire: it?.obligatoire !== false,
          termine: it?.termine === true,
          ordre: typeof it?.ordre === 'number' ? it.ordre : i + 1,
        }))
      : [];

    // Filtre déterministe : retire les items qui doublonnent les documents
    // requis (suivis par la checklist « Documents à fournir »), puis renumérote.
    const docNames = this.requiredDocNames(ctx);
    const items: ChecklistItemDto[] = rawItems
      .filter((it) => !this.matchesDocument(it.libelle, docNames))
      .map((it, i) => ({ ...it, ordre: i + 1 }));

    const titre =
      typeof raw.titre === 'string' ? raw.titre : 'Checklist de la démarche';

    if (items.length > 0 && ctx.folderId) {
      await this.persist(ctx, titre, items);
    }

    return {
      data: { titre, items },
      confidence: items.length > 0 ? 0.85 : 0.4,
      status: items.length > 0 ? 'success' : 'partial',
    };
  }

  /** Noms des documents requis identifiés par le Procedure Agent (lecture lâche). */
  private requiredDocNames(ctx: AgentContext): string[] {
    const proc = readOutput<{ requiredDocuments?: { nom?: string }[] }>(
      ctx,
      AgentName.Procedure,
    );
    return (proc?.data?.requiredDocuments ?? [])
      .map((d) => d?.nom)
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0);
  }

  /** Un item de checklist correspond-il à un document requis (≈ doublon) ? */
  private matchesDocument(libelle: string, docNames: string[]): boolean {
    const norm = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const item = norm(libelle);
    if (!item) return false;
    return docNames.some((d) => {
      const dn = norm(d);
      if (dn.length < 3) return false;
      return item.includes(dn) || dn.includes(item);
    });
  }

  private async persist(
    ctx: AgentContext,
    titre: string,
    items: ChecklistItemDto[],
  ): Promise<void> {
    await this.prisma.checklist.create({
      data: {
        userId: ctx.userId,
        folderId: ctx.folderId,
        titre,
        items: {
          create: items.map((it) => ({
            texte: it.libelle,
            coche: it.termine,
            ordre: it.ordre,
          })),
        },
      },
    });
  }
}
