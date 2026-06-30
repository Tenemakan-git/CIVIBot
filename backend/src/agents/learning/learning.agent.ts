import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Events } from '../../core/events/event-names';
import type { FolderEventPayload } from '../../folders/domain/events/folder.events';
import { ILearningAgent } from './contracts/learning.contract';
import { LearningService } from './learning.service';

/**
 * Learning Agent (réactif) — transforme les signaux du système en
 * recommandations agrégées pour les administrateurs.
 */
@Injectable()
export class LearningAgent implements ILearningAgent {
  constructor(
    private readonly learning: LearningService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent(Events.Folder.Created)
  async onFolderCreated(payload: FolderEventPayload): Promise<void> {
    const cle = payload.procedureSlug || `domaine:${payload.domaine}`;
    await this.learning.record({
      type: 'procedure_demandee',
      cle,
      domaine: payload.domaine,
      recommandation: `Demande fréquente : "${payload.titre ?? cle}". Vérifier la complétude de la documentation.`,
    });
  }

  @OnEvent(Events.Knowledge.InsufficientLocal)
  async onKnowledgeInsufficient(payload: {
    query: string;
    folderId: string;
  }): Promise<void> {
    const cle = payload.query.trim().toLowerCase();
    await this.learning.record({
      type: 'recherche_insuffisante',
      cle,
      recommandation: `Base documentaire insuffisante pour : "${payload.query}". Ajouter une FAQ ou un document officiel.`,
    });
    this.events.emit(Events.Learning.GapDetected, {
      kind: 'knowledge',
      cle,
    });
  }

  @OnEvent(Events.Verification.Completed)
  async onVerification(payload: {
    domaine: string | null;
    status: string;
    missing: string[];
  }): Promise<void> {
    if (payload.status !== 'incomplet' || !payload.missing?.length) return;
    for (const nom of payload.missing) {
      await this.learning.record({
        type: 'document_manquant',
        cle: nom.trim().toLowerCase(),
        domaine: payload.domaine,
        recommandation: `Pièce souvent manquante : "${nom}". Clarifier comment l'obtenir.`,
      });
    }
  }
}
