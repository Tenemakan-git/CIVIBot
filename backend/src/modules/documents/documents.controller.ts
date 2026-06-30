import { Controller, Get, Post, Delete, Param, UploadedFile, UseInterceptors, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Get() findAll(@CurrentUser() user: any) { return this.service.findAll(user.id); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.service.findOne(id, user.id); }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/documents';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') cb(null, true);
      else cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    },
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any, @Body() body: any) {
    return this.service.upload(user.id, file, body.nom);
  }

  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: any) { return this.service.remove(id, user.id); }
}
