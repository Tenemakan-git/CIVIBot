import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertCategoryDto {
  @ApiProperty() @IsString() nom: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty() @IsString() domaineId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
