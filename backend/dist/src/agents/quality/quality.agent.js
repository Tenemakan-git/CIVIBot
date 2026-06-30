"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityAgent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const agent_context_1 = require("../../core/agent/agent-context");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const event_names_1 = require("../../core/events/event-names");
const HALLUCINATION_MAX = 0.6;
const CONFIDENCE_MIN = 0.4;
let QualityAgent = class QualityAgent extends base_agent_abstract_1.BaseAgent {
    events;
    name = agent_name_enum_1.AgentName.Quality;
    constructor(events) {
        super();
        this.events = events;
    }
    async run(ctx) {
        const confidence = this.avgConfidence(ctx);
        const { sufficient, bestScore, chunkCount } = this.knowledgeSignals(ctx);
        const sourceCount = this.countSources(ctx);
        const sourceQuality = Math.min(1, (Math.min(sourceCount, 3) / 3) * 0.5 + bestScore * 0.5);
        const intentConfidence = ctx.intent?.confidence ?? 0.5;
        const coherence = intentConfidence * (sufficient ? 1 : 0.6);
        const grounding = chunkCount > 0 ? bestScore : 0;
        const hallucinationRisk = Math.max(0, 1 - grounding);
        const passed = hallucinationRisk <= HALLUCINATION_MAX && confidence >= CONFIDENCE_MIN;
        const notes = [];
        if (!sufficient)
            notes.push('Ancrage documentaire faible : répondre avec prudence.');
        if (sourceCount === 0)
            notes.push('Aucune source citable.');
        if (confidence < CONFIDENCE_MIN)
            notes.push('Confiance globale des agents faible.');
        const verdict = {
            passed,
            hallucinationRisk: this.round(hallucinationRisk),
            confidence: this.round(confidence),
            coherence: this.round(coherence),
            sourceQuality: this.round(sourceQuality),
            notes,
        };
        if (!passed) {
            this.events.emit(event_names_1.Events.Quality.Failed, {
                folderId: ctx.folderId,
                verdict,
            });
        }
        return {
            data: verdict,
            confidence,
            status: passed ? 'success' : 'partial',
        };
    }
    avgConfidence(ctx) {
        const results = Object.values(ctx.outputs).filter((r) => !!r && r.agent !== agent_name_enum_1.AgentName.Quality);
        if (results.length === 0)
            return 0.5;
        const sum = results.reduce((acc, r) => acc + (r.confidence ?? 0), 0);
        return sum / results.length;
    }
    knowledgeSignals(ctx) {
        const k = (0, agent_context_1.readOutput)(ctx, agent_name_enum_1.AgentName.Knowledge);
        const chunks = k?.data?.chunks ?? [];
        return {
            sufficient: k?.data?.sufficient ?? false,
            bestScore: chunks[0]?.score ?? 0,
            chunkCount: chunks.length,
        };
    }
    countSources(ctx) {
        const keys = new Set();
        for (const r of Object.values(ctx.outputs)) {
            r?.sources?.forEach((s) => keys.add(`${s.organisme}|${s.url ?? ''}`));
        }
        return keys.size;
    }
    round(n) {
        return Math.round(n * 100) / 100;
    }
};
exports.QualityAgent = QualityAgent;
exports.QualityAgent = QualityAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], QualityAgent);
//# sourceMappingURL=quality.agent.js.map