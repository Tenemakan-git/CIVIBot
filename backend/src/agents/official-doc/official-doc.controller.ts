import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { OfficialDocService } from './official-doc.service';

/** Documents officiels pré-remplis d'un dossier (modèles, génération, download). */
@ApiTags('Dossiers administratifs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('folders')
export class OfficialDocController {
  constructor(private readonly docs: OfficialDocService) {}

  /** Modèles applicables au dossier (avec les champs à saisir). */
  @Get(':id/documents/templates')
  templates(@Param('id') id: string, @CurrentUser() user: any) {
    return this.docs.listTemplates(id, user.id);
  }

  /** Documents déjà générés pour le dossier. */
  @Get(':id/documents')
  list(@Param('id') id: string, @CurrentUser() user: any) {
    return this.docs.listGenerated(id, user.id);
  }

  /** Génère un document à partir d'un modèle + des champs saisis. */
  @Post(':id/documents/generate')
  async generate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { templateKey: string; fields?: Record<string, string> },
  ) {
    const doc = await this.docs.generate(
      id,
      user.id,
      body.templateKey,
      body.fields ?? {},
    );
    // On ne renvoie que les métadonnées ; le binaire passe par l'endpoint download.
    return {
      id: doc.id,
      templateKey: doc.templateKey,
      titre: doc.titre,
      filename: doc.filename,
      bytes: doc.bytes,
      createdAt: doc.createdAt,
    };
  }

  /** Téléchargement du PDF d'un document généré. */
  @Get(':id/documents/:docId/pdf')
  async download(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.docs.getFile(id, docId, user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
