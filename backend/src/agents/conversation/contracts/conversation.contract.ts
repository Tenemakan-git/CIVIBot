import { Response } from 'express';

export interface HandleConversationParams {
  userId: string;
  message: string;
  conversationId?: string;
  folderId?: string;
  /** Position du navigateur (optionnelle) pour l'orientation par proximité. */
  lat?: number;
  lng?: number;
}

/**
 * Contrat du Conversation Agent (façade I/O). Il gère le contexte
 * conversationnel et diffuse la réponse, mais ne prend AUCUNE décision métier :
 * il délègue l'orchestration et se contente de synthétiser/streamer.
 */
export interface IConversationAgent {
  handle(params: HandleConversationParams, res: Response): Promise<void>;
}
