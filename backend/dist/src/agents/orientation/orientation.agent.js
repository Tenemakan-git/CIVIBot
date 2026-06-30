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
exports.OrientationAgent = void 0;
const common_1 = require("@nestjs/common");
const agent_name_enum_1 = require("../../core/agent/agent-name.enum");
const base_agent_abstract_1 = require("../../core/agent/base-agent.abstract");
const service_directory_service_1 = require("../../services-directory/service-directory.service");
let OrientationAgent = class OrientationAgent extends base_agent_abstract_1.BaseAgent {
    directory;
    name = agent_name_enum_1.AgentName.Orientation;
    constructor(directory) {
        super();
        this.directory = directory;
    }
    async run(ctx) {
        const domaine = ctx.intent?.domain;
        if (!domaine) {
            return { data: { servicePoints: [] }, confidence: 0.3, status: 'partial' };
        }
        const loc = ctx.metadata?.userLocation;
        const opts = { domaine, limit: 5 };
        if (loc) {
            opts.lat = loc.lat;
            opts.lng = loc.lng;
        }
        const points = await this.directory.find(opts);
        return {
            data: {
                servicePoints: points.map((p) => ({
                    id: p.id,
                    type: p.type,
                    nom: p.nom,
                    adresse: p.adresse,
                    ville: p.ville,
                    telephone: p.telephone,
                    horaires: p.horaires,
                    url: p.url,
                    distanceKm: p.distanceKm ?? null,
                })),
            },
            confidence: points.length > 0 ? 1 : 0.4,
            status: points.length > 0 ? 'success' : 'partial',
        };
    }
};
exports.OrientationAgent = OrientationAgent;
exports.OrientationAgent = OrientationAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [service_directory_service_1.ServiceDirectoryService])
], OrientationAgent);
//# sourceMappingURL=orientation.agent.js.map