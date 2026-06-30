import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportDocumentDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() titre?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() categorie?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() organisme?: string;
}
