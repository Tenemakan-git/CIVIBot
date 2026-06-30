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
exports.LearningAgent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_names_1 = require("../../core/events/event-names");
const learning_service_1 = require("./learning.service");
let LearningAgent = class LearningAgent {
    learning;
    events;
    constructor(learning, events) {
        this.learning = learning;
        this.events = events;
    }
    async onFolderCreated(payload) {
        const cle = payload.procedureSlug || `domaine:${payload.domaine}`;
        await this.learning.record({
            type: 'procedure_demandee',
            cle,
            domaine: payload.domaine,
            recommandation: `Demande fréquente : "${payload.titre ?? cle}". Vérifier la complétude de la documentation.`,
        });
    }
    async onKnowledgeInsufficient(payload) {
        const cle = payload.query.trim().toLowerCase();
        await this.learning.record({
            type: 'recherche_insuffisante',
            cle,
            recommandation: `Base documentaire insuffisante pour : "${payload.query}". Ajouter une FAQ ou un document officiel.`,
        });
        this.events.emit(event_names_1.Events.Learning.GapDetected, {
            kind: 'knowledge',
            cle,
        });
    }
    async onVerification(payload) {
        if (payload.status !== 'incomplet' || !payload.missing?.length)
            return;
        for (const nom of payload.missing) {
            await this.learning.record({
                type: 'document_manquant',
                cle: nom.trim().toLowerCase(),
                domaine: payload.domaine,
                recommandation: `Pièce souvent manquante : "${nom}". Clarifier comment l'obtenir.`,
            });
        }
    }
};
exports.LearningAgent = LearningAgent;
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Folder.Created),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearningAgent.prototype, "onFolderCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Knowledge.InsufficientLocal),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearningAgent.prototype, "onKnowledgeInsufficient", null);
__decorate([
    (0, event_emitter_1.OnEvent)(event_names_1.Events.Verification.Completed),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LearningAgent.prototype, "onVerification", null);
exports.LearningAgent = LearningAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [learning_service_1.LearningService,
        event_emitter_1.EventEmitter2])
], LearningAgent);
//# sourceMappingURL=learning.agent.js.map