import { AgentContext, readOutput } from './agent-context';
import { AgentName } from './agent-name.enum';

/**
 * Helpers de lecture du contexte partagé. Ils lisent `ctx.outputs` avec des
 * formes lâches : aucun agent n'importe le DTO d'un autre agent (découplage).
 */

/** Contexte documentaire assemblé par le Knowledge Agent (vide si absent). */
export function knowledgeContext(ctx: AgentContext): string {
  const k = readOutput<{ context?: string }>(ctx, AgentName.Knowledge);
  return k?.data?.context ?? '';
}

/** Résumé textuel de l'intention pour amorcer les prompts. */
export function intentSummary(ctx: AgentContext): string {
  const i = ctx.intent;
  if (!i) return ctx.userMessage;
  return [
    `Domaine: ${i.domain}`,
    i.procedure ? `Procédure: ${i.procedure}` : null,
    `Intention: ${i.intent}`,
    i.detectedNeeds.length ? `Besoins: ${i.detectedNeeds.join(', ')}` : null,
    `Message utilisateur: "${ctx.userMessage}"`,
  ]
    .filter(Boolean)
    .join('\n');
}
