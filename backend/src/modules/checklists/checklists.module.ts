import { Module } from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { ChecklistsController } from './checklists.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FolderModule } from '../../folders/folder.module';

@Module({
  imports: [PrismaModule, FolderModule],
  providers: [ChecklistsService],
  controllers: [ChecklistsController],
})
export class ChecklistsModule {}
