"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderModule = void 0;
const common_1 = require("@nestjs/common");
const folder_repository_port_1 = require("./domain/folder.repository.port");
const prisma_folder_repository_1 = require("./infrastructure/prisma-folder.repository");
const folder_service_1 = require("./application/folder.service");
const required_docs_checklist_service_1 = require("./application/required-docs-checklist.service");
const folder_controller_1 = require("./interface/folder.controller");
let FolderModule = class FolderModule {
};
exports.FolderModule = FolderModule;
exports.FolderModule = FolderModule = __decorate([
    (0, common_1.Module)({
        controllers: [folder_controller_1.FolderController],
        providers: [
            { provide: folder_repository_port_1.FOLDER_REPOSITORY, useClass: prisma_folder_repository_1.PrismaFolderRepository },
            folder_service_1.FolderService,
            required_docs_checklist_service_1.RequiredDocsChecklistService,
        ],
        exports: [folder_service_1.FolderService, required_docs_checklist_service_1.RequiredDocsChecklistService, folder_repository_port_1.FOLDER_REPOSITORY],
    })
], FolderModule);
//# sourceMappingURL=folder.module.js.map