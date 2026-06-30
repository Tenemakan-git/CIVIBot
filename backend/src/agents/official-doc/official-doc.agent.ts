import { Injectable } from '@nestjs/common';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext } from '../../core/agent/agent-context';
import { AgentRunOutput } from '../../core/agent/agent-result';
import { BaseAgent } from '../../core/agent/base-agent.abstract';
import { IOfficialDocAgent } from './contracts/official-doc.contract';
import { OfficialDocSuggestionDto } from './dto/official-doc-suggestion.dto';
import { templatesForDomaine } from './templates/document-templates';

/**
 * Official Document Agent — déterministe : à partir du domaine/procédure de
 * l'intention, propose les modèles de documents que l'utilisateur peut faire
 * pré-remplir. N'appelle aucun LLM ; la génération est déclenchée à la demande
 * via le controller (sécurité des données personnelles).
 */
@Injectable()
export class OfficialDocAgent
  extends BaseAgent<OfficialDocSuggestionDto>
  implements IOfficialDocAgent
{
  readonly name = AgentName.OfficialDocument;

  protected run(
    ctx: AgentContext,
  ): Promise<AgentRunOutput<OfficialDocSuggestionDto>> {
    const domaine = ctx.intent?.domain;
    const templates = domaine
      ? templatesForDomaine(domaine, ctx.intent?.procedure)
      : [];

    return Promise.resolve({
      data: {
        availableTemplates: templates.map((t) => ({
          key: t.key,
          titre: t.titre,
          description: t.description,
        })),
      },
      confidence: 1,
      status: 'success',
    });
  }
}
