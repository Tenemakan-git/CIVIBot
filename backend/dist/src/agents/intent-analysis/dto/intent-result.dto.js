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
exports.IntentResultDto = void 0;
const class_validator_1 = require("class-validator");
const agent_name_enum_1 = require("../../../core/agent/agent-name.enum");
const domain_enum_1 = require("../../../core/agent/domain.enum");
class IntentResultDto {
    intent;
    domain;
    procedure;
    confidence;
    priority;
    detectedNeeds;
    actions;
}
exports.IntentResultDto = IntentResultDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntentResultDto.prototype, "intent", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(domain_enum_1.Domain),
    __metadata("design:type", String)
], IntentResultDto.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], IntentResultDto.prototype, "procedure", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], IntentResultDto.prototype, "confidence", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['low', 'normal', 'high']),
    __metadata("design:type", String)
], IntentResultDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], IntentResultDto.prototype, "detectedNeeds", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(agent_name_enum_1.AgentName, { each: true }),
    __metadata("design:type", Array)
], IntentResultDto.prototype, "actions", void 0);
//# sourceMappingURL=intent-result.dto.js.map