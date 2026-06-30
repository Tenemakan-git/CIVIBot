import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProcedureDto {
  @ApiProperty() @IsString() categorieId: string;
  @ApiProperty() @IsString() titre: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() cout?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() delai?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() eligibilite?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() resume?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() actif?: boolean;
}
