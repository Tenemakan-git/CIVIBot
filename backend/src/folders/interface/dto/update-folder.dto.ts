import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class RenameFolderDto {
  @IsString()
  @MinLength(2)
  titre!: string;
}

export class SetProgressDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progression!: number;
}
