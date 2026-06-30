import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChecklistsService } from './checklists.service';
import { ToggleItemDto } from './dto/toggle-item.dto';

@ApiTags('Checklists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checklists')
export class ChecklistsController {
  constructor(private service: ChecklistsService) {}

  @Get() findAll(@CurrentUser() user: any) { return this.service.findAll(user.id); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.service.findOne(id, user.id); }

  @Post()
  create(@CurrentUser() user: any, @Body() body: { titre: string; items: string[] }) {
    return this.service.create(user.id, body.titre, body.items || []);
  }

  @Patch(':id/items/:itemId')
  toggleItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: any,
    @Body() dto: ToggleItemDto,
  ) {
    return this.service.toggleItem(id, itemId, user.id, dto.coche);
  }

  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: any) { return this.service.remove(id, user.id); }
}
