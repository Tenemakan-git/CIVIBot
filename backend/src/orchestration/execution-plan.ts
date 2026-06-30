import { AgentName } from '../core/agent/agent-name.enum';

/**
 * File d'exécution ordonnée d'un workflow. Supporte l'ajout dynamique d'agents
 * (followups) sans ré-exécuter un agent déjà traité, sauf re-demande explicite.
 */
export class ExecutionPlan {
  private readonly queue: AgentName[];
  private readonly done = new Set<AgentName>();

  constructor(initial: AgentName[]) {
    this.queue = [...initial];
  }

  next(): AgentName | undefined {
    return this.queue.shift();
  }

  markDone(agent: AgentName): void {
    this.done.add(agent);
  }

  /**
   * Ajoute des agents demandés en followup. `front` les place en tête (le
   * sous-graphe s'exécute immédiatement, avant la suite du pipeline) ;
   * `allowRerun` ré-autorise un agent déjà terminé (re-run de Knowledge après
   * enrichissement).
   */
  enqueue(
    agents: AgentName[],
    options: { allowRerun?: boolean; front?: boolean } = {},
  ): void {
    const toAdd = options.front ? [...agents].reverse() : agents;
    for (const a of toAdd) {
      if (this.queue.includes(a)) continue;
      if (this.done.has(a)) {
        if (!options.allowRerun) continue;
        this.done.delete(a);
      }
      if (options.front) this.queue.unshift(a);
      else this.queue.push(a);
    }
  }

  get pending(): AgentName[] {
    return [...this.queue];
  }
}
