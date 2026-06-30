import { api } from './api';

export interface QuestionnaireOption {
  value: string;
  label: string;
  next?: string;
}
export interface QuestionnaireNode {
  id: string;
  question: string;
  options: QuestionnaireOption[];
}
export interface Questionnaire {
  start: string;
  questions: QuestionnaireNode[];
}

export interface JourneyResult {
  sessionId?: string;
  folderId: string | null;
  conversationId: string | null;
}

export const journeyService = {
  questionnaire: (): Promise<Questionnaire> =>
    api.get('/journeys/questionnaire').then((r) => r.data),
  start: (): Promise<{ id: string }> =>
    api.post('/journeys').then((r) => r.data),
  answer: (
    sessionId: string,
    body: { question: string; reponse: string; ordre: number },
  ) => api.post(`/journeys/${sessionId}/answers`, body).then((r) => r.data),
  complete: (sessionId: string): Promise<JourneyResult> =>
    api.post(`/journeys/${sessionId}/complete`).then((r) => r.data),
};
