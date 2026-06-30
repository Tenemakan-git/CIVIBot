import { ExecutionPlan } from './execution-plan';
import { AgentName } from '../core/agent/agent-name.enum';

describe('ExecutionPlan', () => {
  it('restitue les agents dans l\'ordre initial', () => {
    const plan = new ExecutionPlan([AgentName.Knowledge, AgentName.Planning]);
    expect(plan.next()).toBe(AgentName.Knowledge);
    expect(plan.next()).toBe(AgentName.Planning);
    expect(plan.next()).toBeUndefined();
  });

  it('insère les followups en tête (front) pour exécuter le sous-graphe d\'abord', () => {
    const plan = new ExecutionPlan([AgentName.Planning, AgentName.Procedure]);
    expect(plan.next()).toBe(AgentName.Planning);
    plan.enqueue([AgentName.WebResearch], { front: true });
    expect(plan.next()).toBe(AgentName.WebResearch); // avant Procedure
    expect(plan.next()).toBe(AgentName.Procedure);
  });

  it('déduplique un agent déjà terminé sauf allowRerun', () => {
    const plan = new ExecutionPlan([AgentName.Knowledge]);
    plan.next();
    plan.markDone(AgentName.Knowledge);

    plan.enqueue([AgentName.Knowledge]); // ignoré (déjà fait)
    expect(plan.next()).toBeUndefined();

    plan.enqueue([AgentName.Knowledge], { allowRerun: true }); // re-autorisé
    expect(plan.next()).toBe(AgentName.Knowledge);
  });

  it('ne met pas deux fois en file le même agent', () => {
    const plan = new ExecutionPlan([AgentName.Knowledge]);
    plan.enqueue([AgentName.Knowledge]);
    expect(plan.pending).toEqual([AgentName.Knowledge]);
  });
});
