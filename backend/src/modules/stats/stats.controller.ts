import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StatsService } from './stats.service';

@ApiTags('Admin - Stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/stats')
export class StatsController {
  constructor(private service: StatsService) {}

  @Get() getStats() { return this.service.getStats(); }

  /** Coûts & usage IA (série par jour, par modèle, totaux). */
  @Get('usage')
  getUsage(@Query('days') days?: string) {
    return this.service.getUsage(days !== undefined ? Number(days) : undefined);
  }
}
