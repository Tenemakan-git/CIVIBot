import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

/** Entrée du point d'accès agentique (Conversation Agent). */
export class HandleMessageDto {
  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  /** Position du navigateur (optionnelle, avec consentement) pour l'orientation. */
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
