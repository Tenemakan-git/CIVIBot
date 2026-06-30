import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@ApiTags('Procedures')
@Controller('procedures')
export class ProceduresController {
  constructor(private service: ProceduresService) {}

  @Get() findAll(@Query('categorieId') categorieId?: string) {
    return this.service.findPublished(categorieId);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
}

@ApiTags('Admin - Procedures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/procedures')
export class AdminProceduresController {
  constructor(private service: ProceduresService) {}

  @Get() findAll(@Query('categorieId') categorieId?: string) { return this.service.findAll(categorieId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() create(@Body() dto: CreateProcedureDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProcedureDto) { return this.service.update(id, dto); }
  @Patch(':id/publish') publish(@Param('id') id: string) { return this.service.publish(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
