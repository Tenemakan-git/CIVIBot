import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../modules/auth/guards/jwt.guard';
import {
  ServiceDirectoryService,
  ServicePointView,
} from './service-directory.service';

/** Annuaire géolocalisé des services administratifs compétents. */
@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServiceDirectoryController {
  constructor(private readonly directory: ServiceDirectoryService) {}

  /**
   * Liste les points de service. Filtres optionnels `domaine`/`type` ; si
   * `lat`+`lng` sont fournis, tri par proximité.
   */
  @Get()
  find(
    @Query('domaine') domaine?: string,
    @Query('type') type?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('limit') limit?: string,
  ): Promise<ServicePointView[]> {
    return this.directory.find({
      domaine: domaine || undefined,
      type: type || undefined,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
    });
  }
}
