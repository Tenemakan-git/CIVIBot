import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JourneysService } from './journeys.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';

@ApiTags('Journeys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journeys')
export class JourneysController {
  constructor(private service: JourneysService) {}

  @Get() findAll(@CurrentUser() user: any) { return this.service.findAll(user.id); }
  // Doit précéder `@Get(':id')` sinon "questionnaire" serait capté comme un id.
  @Get('questionnaire') questionnaire() { return this.service.questionnaire(); }
  @Post() create(@CurrentUser() user: any) { return this.service.create(user.id); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.service.findOne(id, user.id); }

  @Post(':id/answers')
  addAnswer(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: AnswerQuestionDto) {
    return this.service.addAnswer(id, user.id, dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.complete(id, user.id);
  }
}
