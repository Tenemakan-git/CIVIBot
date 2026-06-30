import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { PdfService } from './pdf.service';

/** Génération/téléchargement à la demande du PDF d'un dossier. */
@ApiTags('Dossiers administratifs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('folders')
export class PdfController {
  constructor(private readonly pdf: PdfService) {}

  @Get(':id/pdf')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ): Promise<void> {
    const rendered = await this.pdf.generate(id, user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${rendered.filename}"`,
    );
    res.send(rendered.buffer);
  }
}
