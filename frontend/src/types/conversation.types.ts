export interface Conversation {
  id: string;
  userId: string;
  titre: string;
  statut: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'USER' | 'AI';
  contenu: string;
  tokens?: number;
  modeleUtilise?: string;
  createdAt: string;
}
