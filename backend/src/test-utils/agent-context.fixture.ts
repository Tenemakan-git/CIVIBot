import { AgentContext } from '../core/agent/agent-context';
import { AgentName } from '../core/agent/agent-name.enum';
import { AgentResult } from '../core/agent/agent-result';

/** Construit un AgentContext de test (surchargeable). */
export function makeContext(overrides: Partial<AgentContext> = {}): AgentContext {
  return {
    runId: 'run-1',
    folderId: 'folder-1',
    userId: 'user-1',
    conversationId: 'conv-1',
    locale: 'fr',
    userMessage: 'Je veux créer une SARL',
    outputs: {},
    metadata: {},
    ...overrides,
  };
}

/** Injecte la sortie d'un agent dans le contexte (pour simuler ctx.outputs). */
export function withOutput<T>(
  ctx: AgentContext,
  agent: AgentName,
  data: T,
  extra: Partial<AgentResult<T>> = {},
): AgentContext {
  ctx.outputs[agent] = {
    agent,
    status: 'success',
    confidence: 1,
    data,
    ...extra,
  } as AgentResult;
  return ctx;
}
