import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty() @IsString() question: string;
  @ApiProperty() @IsString() reponse: string;
  @ApiProperty() @IsInt() ordre: number;
}
