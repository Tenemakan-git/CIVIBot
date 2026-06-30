import { Controller, Get, Post, Delete, Param, UploadedFile, UseInterceptors, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { KnowledgeService } from './knowledge.service';

@ApiTags('Admin - Knowledge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super-admin')
@Controller('admin/knowledge')
export class KnowledgeController {
  constructor(private service: KnowledgeService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/knowledge';
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
  async import(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.service.import(file.path, body.titre || file.originalname, body.categorie, body.organisme);
  }

  @Post(':id/reindex') reindex(@Param('id') id: string) { return this.service.reindex(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
