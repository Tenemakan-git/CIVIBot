import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConversationsService } from './conversations.service';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private service: ConversationsService) {}

  @Get() findAll(@CurrentUser() user: any) { return this.service.findAll(user.id); }
  @Post() create(@CurrentUser() user: any, @Body() body: any) { return this.service.create(user.id, body.titre); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.service.findOne(id, user.id); }
  @Patch(':id') update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) { return this.service.update(id, user.id, body); }
  @Patch(':id/archive') archive(@Param('id') id: string, @CurrentUser() user: any) { return this.service.archive(id, user.id); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: any) { return this.service.remove(id, user.id); }
}
