"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeContext = knowledgeContext;
exports.intentSummary = intentSummary;
const agent_context_1 = require("./agent-context");
const agent_name_enum_1 = require("./agent-name.enum");
function knowledgeContext(ctx) {
    const k = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Knowledge);
    return k?.data?.context ?? '';
}
function intentSummary(ctx) {
    const i = ctx.intent;
    if (!i)
        return ctx.userMessage;
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
//# sourceMappingURL=context-helpers.js.map