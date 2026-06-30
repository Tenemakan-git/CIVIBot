import { Module } from '@nestjs/common';
import { FolderModule } from '../../folders/folder.module';
import { MonitoringAgent } from './monitoring.agent';

@Module({
  imports: [FolderModule],
  providers: [MonitoringAgent],
  exports: [MonitoringAgent],
})
export class MonitoringAgentModule {}
