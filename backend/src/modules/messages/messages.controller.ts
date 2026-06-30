import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * Persistance des messages d'une conversation (lecture + sauvegarde).
 * Le streaming de la réponse IA est assuré par le flux agentique
 * `POST /agent/messages` (ConversationAgent → Orchestrator).
 */
@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @Get()
  findAll(@Param('conversationId') id: string, @CurrentUser() user: any) {
    return this.messages.findAll(id, user.id);
  }

  @Post()
  async send(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.messages.saveUserMessage(conversationId, dto.contenu, user.id);
  }
}
