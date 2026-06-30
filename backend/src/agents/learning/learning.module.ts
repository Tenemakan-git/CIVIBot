import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningAgent } from './learning.agent';
import { LearningController } from './learning.controller';

@Module({
  controllers: [LearningController],
  providers: [LearningService, LearningAgent],
  exports: [LearningService],
})
export class LearningAgentModule {}
