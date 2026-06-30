import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Domain } from '../../../core/agent/domain.enum';

export class CreateFolderDto {
  @IsEnum(Domain)
  domaine!: Domain;

  @IsString()
  @MinLength(2)
  titre!: string;

  @IsOptional()
  @IsString()
  procedureSlug?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
