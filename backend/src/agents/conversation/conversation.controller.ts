import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { HandleMessageDto } from '../../orchestration/dto/handle-message.dto';
import { ConversationAgent } from './conversation.agent';

/**
 * Point d'accès agentique (SSE). Aucune logique métier : délègue au
 * Conversation Agent, qui orchestre puis diffuse la réponse.
 */
@ApiTags('Agent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agent')
export class ConversationController {
  constructor(private readonly agent: ConversationAgent) {}

  @Post('messages')
  async message(
    @CurrentUser() user: any,
    @Body() dto: HandleMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.agent.handle(
      {
        userId: user.id,
        message: dto.message,
        conversationId: dto.conversationId,
        folderId: dto.folderId,
        lat: dto.lat,
        lng: dto.lng,
      },
      res,
    );
  }
}
