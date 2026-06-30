import { Module } from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { JourneysController } from './journeys.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrchestrationModule } from '../../orchestration/orchestration.module';

@Module({
  imports: [PrismaModule, OrchestrationModule],
  providers: [JourneysService],
  controllers: [JourneysController],
})
export class JourneysModule {}
