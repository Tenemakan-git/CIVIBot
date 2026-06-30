import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { FolderModule } from '../folders/folder.module';
import { AgentRegistry } from './agent-registry';
import { WorkflowFactory } from './workflow.factory';
import { OrchestratorService } from './orchestrator.service';

/**
 * Module d'orchestration. `DiscoveryModule` permet à l'AgentRegistry de
 * découvrir automatiquement tous les agents instanciés dans l'application.
 * Les `*AgentModule` sont importés au niveau de l'AppModule.
 */
@Module({
  imports: [DiscoveryModule, FolderModule],
  providers: [AgentRegistry, WorkflowFactory, OrchestratorService],
  exports: [OrchestratorService],
})
export class OrchestrationModule {}
