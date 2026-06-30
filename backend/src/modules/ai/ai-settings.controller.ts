import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Admin - AI Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/ai-settings')
export class AiSettingsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getSettings() {
    let settings = await this.prisma.aiSettings.findFirst();
    if (!settings) settings = await this.prisma.aiSettings.create({ data: {} });
    return settings;
  }

  @Patch()
  async updateSettings(@Body() body: any) {
    const existing = await this.prisma.aiSettings.findFirst();
    if (!existing) {
      return this.prisma.aiSettings.create({ data: body });
    }
    return this.prisma.aiSettings.update({ where: { id: existing.id }, data: body });
  }
}
