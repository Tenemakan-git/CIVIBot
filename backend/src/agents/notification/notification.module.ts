import { Module } from '@nestjs/common';
import { FolderModule } from '../../folders/folder.module';
import { NotificationAgent } from './notification.agent';

@Module({
  imports: [FolderModule],
  providers: [NotificationAgent],
  exports: [NotificationAgent],
})
export class NotificationAgentModule {}
