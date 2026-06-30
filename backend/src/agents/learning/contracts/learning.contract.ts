/**
 * Contrat du Learning Agent. Agent RÉACTIF : observe les procédures demandées,
 * les recherches insuffisantes (FAQ/doc manquants) et les pièces manquantes
 * pour produire des recommandations destinées aux administrateurs.
 */
export interface ILearningAgent {
  onFolderCreated(payload: unknown): Promise<void>;
}
