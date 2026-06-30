import { AgentName } from './agent-name.enum';
import { Domain } from './domain.enum';

export type IntentPriority = 'low' | 'normal' | 'high';

/**
 * Résultat structuré de l'analyse d'intention. Forme transverse, lue par
 * l'Orchestrator et de nombreux agents — vit donc dans le shared kernel.
 * Le DTO `IntentResultDto` de l'IntentAnalysisAgent implémente ce contrat
 * (avec les décorateurs class-validator pour la validation runtime).
 */
export interface IntentResult {
  /** Identifiant logique de l'intention, ex: "obtenir_acte_naissance". */
  intent: string;
  domain: Domain;
  /** Slug de procédure si identifiée, sinon null. */
  procedure: string | null;
  /** Score de confiance 0..1. */
  confidence: number;
  priority: IntentPriority;
  /** Besoins détectés dans le message utilisateur. */
  detectedNeeds: string[];
  /** Agents suggérés (indicatif — l'Orchestrator reste seul décideur). */
  actions: AgentName[];
}
