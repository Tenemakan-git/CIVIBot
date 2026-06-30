"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeContext = makeContext;
exports.withOutput = withOutput;
function makeContext(overrides = {}) {
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
function withOutput(ctx, agent, data, extra = {}) {
    ctx.outputs[agent] = {
        agent,
        status: 'success',
        confidence: 1,
        data,
        ...extra,
    };
    return ctx;
}
//# sourceMappingURL=agent-context.fixture.js.map