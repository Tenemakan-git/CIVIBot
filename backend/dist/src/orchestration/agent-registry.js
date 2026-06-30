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
var AgentRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const agent_name_enum_1 = require("../core/agent/agent-name.enum");
let AgentRegistry = AgentRegistry_1 = class AgentRegistry {
    discovery;
    logger = new common_1.Logger(AgentRegistry_1.name);
    agents = new Map();
    validNames = new Set(Object.values(agent_name_enum_1.AgentName));
    constructor(discovery) {
        this.discovery = discovery;
    }
    onModuleInit() {
        for (const wrapper of this.discovery.getProviders()) {
            const instance = wrapper.instance;
            if (instance &&
                typeof instance === 'object' &&
                typeof instance.execute === 'function' &&
                typeof instance.name === 'string' &&
                this.validNames.has(instance.name)) {
                this.agents.set(instance.name, instance);
            }
        }
        this.logger.log(`Agents enregistrés (${this.agents.size}): ${[...this.agents.keys()].join(', ')}`);
    }
    has(name) {
        return this.agents.has(name);
    }
    get(name) {
        const agent = this.agents.get(name);
        if (!agent)
            throw new Error(`Agent non enregistré: ${name}`);
        return agent;
    }
    list() {
        return [...this.agents.keys()];
    }
};
exports.AgentRegistry = AgentRegistry;
exports.AgentRegistry = AgentRegistry = AgentRegistry_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.DiscoveryService])
], AgentRegistry);
//# sourceMappingURL=agent-registry.js.map