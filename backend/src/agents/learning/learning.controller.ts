import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { LearningService } from './learning.service';

/** Recommandations du Learning Agent — réservées aux administrateurs. */
@ApiTags('Admin - Learning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/learning')
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  @Get('insights')
  insights() {
    return this.learning.topInsights();
  }
}
