import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get('me') getMe(@CurrentUser() user: any) {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  @Patch('me') updateMe(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.service.update(user.id, dto);
  }

  @Patch('me/password') changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(user.id, dto);
  }
}

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private service: UsersService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.service.update(id, dto); }
  @Patch(':id/suspend') suspend(@Param('id') id: string) { return this.service.suspend(id); }
  @Patch(':id/activate') activate(@Param('id') id: string) { return this.service.activate(id); }
}
