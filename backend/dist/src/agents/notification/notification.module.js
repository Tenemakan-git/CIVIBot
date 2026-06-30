"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationAgentModule = void 0;
const common_1 = require("@nestjs/common");
const folder_module_1 = require("../../folders/folder.module");
const notification_agent_1 = require("./notification.agent");
let NotificationAgentModule = class NotificationAgentModule {
};
exports.NotificationAgentModule = NotificationAgentModule;
exports.NotificationAgentModule = NotificationAgentModule = __decorate([
    (0, common_1.Module)({
        imports: [folder_module_1.FolderModule],
        providers: [notification_agent_1.NotificationAgent],
        exports: [notification_agent_1.NotificationAgent],
    })
], NotificationAgentModule);
//# sourceMappingURL=notification.module.js.map