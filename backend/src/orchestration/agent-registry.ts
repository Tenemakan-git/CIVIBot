import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { AgentName } from '../core/agent/agent-name.enum';
import { IAgent } from '../core/agent/agent.interface';

/**
 * Registre des agents. Peuplé automatiquement par auto-découverte : tout
 * provider exposant `{ name: AgentName, execute() }` est enregistré (OCP —
 * ajouter un agent ne modifie pas l'Orchestrator). L'Orchestrator ne voit que
 * des `IAgent` opaques.
 */
@Injectable()
export class AgentRegistry implements OnModuleInit {
  private readonly logger = new Logger(AgentRegistry.name);
  private readonly agents = new Map<AgentName, IAgent>();
  private readonly validNames = new Set<string>(Object.values(AgentName));

  constructor(private readonly discovery: DiscoveryService) {}

  onModuleInit(): void {
    for (const wrapper of this.discovery.getProviders()) {
      const instance = wrapper.instance as Partial<IAgent> | undefined;
      if (
        instance &&
        typeof instance === 'object' &&
        typeof instance.execute === 'function' &&
        typeof instance.name === 'string' &&
        this.validNames.has(instance.name)
      ) {
        this.agents.set(instance.name as AgentName, instance as IAgent);
      }
    }
    this.logger.log(
      `Agents enregistrés (${this.agents.size}): ${[...this.agents.keys()].join(', ')}`,
    );
  }

  has(name: AgentName): boolean {
    return this.agents.has(name);
  }

  get(name: AgentName): IAgent {
    const agent = this.agents.get(name);
    if (!agent) throw new Error(`Agent non enregistré: ${name}`);
    return agent;
  }

  list(): AgentName[] {
    return [...this.agents.keys()];
  }
}
