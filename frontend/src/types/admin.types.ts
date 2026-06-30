export interface KnowledgeDocument {
  id: string;
  titre: string;
  fichier: string;
  version: string;
  categorie?: string;
  organisme?: string;
  actif: boolean;
  createdAt: string;
  _count?: { chunks: number };
}

export interface AiSettings {
  id: string;
  modele: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  seuilSimilarite: number;
  promptSysteme: string;
}

export interface Stats {
  users: number;
  conversations: number;
  documents: number;
  aiLogs: number;
}
