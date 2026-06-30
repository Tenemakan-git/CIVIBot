import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { FolderService } from '../application/folder.service';
import { RequiredDocsChecklistService } from '../application/required-docs-checklist.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { RenameFolderDto, SetProgressDto } from './dto/update-folder.dto';

/**
 * Couche interface : aucune logique métier, délégation pure au FolderService.
 */
@ApiTags('Dossiers administratifs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FolderController {
  constructor(
    private readonly service: FolderService,
    private readonly requiredDocs: RequiredDocsChecklistService,
  ) {}

  @Get()
  async list(@CurrentUser() user: any) {
    // ⚠️ L'entité stocke ses données dans des champs privés (`_titre`…) exposés
    // via getters ; `JSON.stringify` ne sérialise PAS les getters. On renvoie
    // donc le snapshot plat (titre/statut/progression/domaine/updatedAt).
    const folders = await this.service.listForUser(user.id);
    return folders.map((f) => f.toSnapshot());
  }

  // ⚠️ Déclaré AVANT `:id` pour ne pas être capté par la route paramétrée.
  @Get('notifications')
  notifications(@CurrentUser() user: any) {
    return this.service.listNotifications(user.id);
  }

  @Patch('notifications/read-all')
  readAllNotifications(@CurrentUser() user: any) {
    return this.service.markAllNotificationsRead(user.id);
  }

  @Patch('notifications/:id/read')
  readNotification(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.markNotificationRead(id, user.id);
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateFolderDto) {
    const folder = await this.service.createFolder({
      userId: user.id,
      domaine: dto.domaine,
      titre: dto.titre,
      procedureSlug: dto.procedureSlug ?? null,
      conversationId: dto.conversationId ?? null,
    });
    return folder.toSnapshot();
  }

  @Get(':id')
  view(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getView(id, user.id);
  }

  @Patch(':id/rename')
  rename(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: RenameFolderDto,
  ) {
    return this.service.rename(id, user.id, dto.titre);
  }

  @Patch(':id/progress')
  async progress(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SetProgressDto,
  ) {
    const folder = await this.service.setProgress(id, user.id, dto.progression);
    return folder.toSnapshot();
  }

  @Patch(':id/terminate')
  terminate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.terminate(id, user.id);
  }

  /** Marque un document requis comme fourni/manquant (synchro checklist + progression). */
  @Patch(':id/documents/:docId')
  async setDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @CurrentUser() user: any,
    @Body() body: { fourni: boolean },
  ) {
    const view = await this.service.getView(id, user.id); // appartenance
    if (!view.documents.some((d) => d.id === docId)) {
      throw new NotFoundException('Document introuvable dans ce dossier');
    }
    await this.requiredDocs.setDocProvided(docId, !!body.fourni);
    return this.service.getView(id, user.id); // vue rafraîchie (progression + docs)
  }
}
