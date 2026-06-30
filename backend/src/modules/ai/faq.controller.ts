import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Admin - FAQ')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/faq')
export class FaqController {
  constructor(private prisma: PrismaService) {}

  @Get() findAll(@Query('procedureId') procedureId?: string) {
    return this.prisma.faq.findMany({
      where: procedureId ? { procedureId } : undefined,
      include: { procedure: true },
    });
  }

  @Post()
  create(@Body() body: { question: string; reponse: string; procedureId?: string }) {
    return this.prisma.faq.create({ data: body });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.prisma.faq.update({ where: { id }, data: body });
  }

  @Delete(':id') remove(@Param('id') id: string) { return this.prisma.faq.delete({ where: { id } }); }
}

@ApiTags('Admin - Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/sources')
export class SourcesController {
  constructor(private prisma: PrismaService) {}

  @Get() findAll(@Query('procedureId') procedureId?: string) {
    return this.prisma.source.findMany({
      where: procedureId ? { procedureId } : undefined,
      include: { procedure: true },
    });
  }

  @Post()
  create(@Body() body: { organisme: string; url?: string; procedureId?: string; dateMiseAJour?: string }) {
    return this.prisma.source.create({ data: body });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.prisma.source.update({ where: { id }, data: body });
  }

  @Delete(':id') remove(@Param('id') id: string) { return this.prisma.source.delete({ where: { id } }); }
}
