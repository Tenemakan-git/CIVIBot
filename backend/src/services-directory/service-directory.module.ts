import { Module } from '@nestjs/common';
import { ServiceDirectoryService } from './service-directory.service';
import { ServiceDirectoryController } from './service-directory.controller';

@Module({
  controllers: [ServiceDirectoryController],
  providers: [ServiceDirectoryService],
  exports: [ServiceDirectoryService],
})
export class ServiceDirectoryModule {}
