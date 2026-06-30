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
import { IDocumentAgent } from './contracts/document.contract';
import {
  BundleDocumentDto,
  DocumentBundleDto,
} from './dto/document-bundle.dto';

/** Document Agent — résumé + liste des documents + pièces nécessaires. */
@Injectable()
export class DocumentAgent
  extends BaseAgent<DocumentBundleDto>
  implements IDocumentAgent
{
  readonly name = AgentName.Document;

  private readonly system = [
    "Tu es l'agent documentaire de CiviBot (Côte d'Ivoire).",
    'Construis le dossier documentaire de la démarche. Renvoie UNIQUEMENT un JSON:',
    '{',
    '  "resume": string,',
    '  "documents": [{ "nom": string, "statut": "manquant" }],',
    '  "piecesNecessaires": string[]',
    '}',
    'Pas de texte hors JSON.',
  ].join('\n');

  constructor(@Inject(LLM_PROVIDER) private readonly llm: ILlmProvider) {
    super();
  }

  protected async run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<DocumentBundleDto>> {
    // Réutilise les documents requis déjà produits par le Procedure Agent.
    const proc = readOutput<{ requiredDocuments?: { nom: string }[] }>(
      ctx,
      AgentName.Procedure,
    );
    const knownDocs = (proc?.data?.requiredDocuments ?? [])
      .map((d) => d.nom)
      .filter(Boolean);

    const raw = await this.llm.completeJson<Partial<DocumentBundleDto>>({
      tier: 'generation',
      system: this.system,
      messages: [
        {
          role: 'user',
          content: [
            intentSummary(ctx),
            knownDocs.length
              ? `Documents déjà identifiés: ${knownDocs.join(', ')}`
              : null,
            `Contexte:\n${knowledgeContext(ctx) || '(aucun)'}`,
          ]
            .filter(Boolean)
            .join('\n\n'),
        },
      ],
    });

    let documents: BundleDocumentDto[] = Array.isArray(raw.documents)
      ? raw.documents
          .filter((d) => d && typeof d.nom === 'string')
          .map((d) => ({
            nom: d.nom,
            statut: d.statut === 'fourni' ? 'fourni' : 'manquant',
          }))
      : [];

    // Repli : ne pas perdre les documents déjà identifiés par le Procedure Agent.
    if (documents.length === 0 && knownDocs.length > 0) {
      documents = knownDocs.map((nom) => ({ nom, statut: 'manquant' as const }));
    }

    return {
      data: {
        resume: typeof raw.resume === 'string' ? raw.resume : '',
        documents,
        piecesNecessaires: Array.isArray(raw.piecesNecessaires)
          ? raw.piecesNecessaires.filter((p) => typeof p === 'string')
          : [],
      },
      confidence: documents.length > 0 ? 0.85 : 0.5,
    };
  }
}
