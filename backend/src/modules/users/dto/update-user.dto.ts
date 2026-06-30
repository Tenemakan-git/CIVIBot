import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(2) nom?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(2) prenom?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telephone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() langue?: string;
}
