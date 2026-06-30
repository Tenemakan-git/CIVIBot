import { Module } from '@nestjs/common';
import { FOLDER_REPOSITORY } from './domain/folder.repository.port';
import { PrismaFolderRepository } from './infrastructure/prisma-folder.repository';
import { FolderService } from './application/folder.service';
import { RequiredDocsChecklistService } from './application/required-docs-checklist.service';
import { FolderController } from './interface/folder.controller';

/**
 * Bounded context "AdministrativeFolder" (DDD).
 * Expose `FolderService` (utilisé par le FolderAgent) et le token repository.
 */
@Module({
  controllers: [FolderController],
  providers: [
    { provide: FOLDER_REPOSITORY, useClass: PrismaFolderRepository },
    FolderService,
    RequiredDocsChecklistService,
  ],
  exports: [FolderService, RequiredDocsChecklistService, FOLDER_REPOSITORY],
})
export class FolderModule {}
