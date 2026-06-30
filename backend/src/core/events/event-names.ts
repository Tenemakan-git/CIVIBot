/**
 * Catalogue centralisé des noms d'événements de domaine.
 * Toute émission/abonnement passe par ces constantes (pas de chaînes magiques).
 */
export const Events = {
  Folder: {
    Created: 'folder.created',
    Updated: 'folder.updated',
    Completed: 'folder.completed',
  },
  Checklist: {
    ItemToggled: 'checklist.item.toggled',
  },
  Knowledge: {
    InsufficientLocal: 'knowledge.insufficient',
    CandidatesReady: 'knowledge.candidates.ready',
    Committed: 'knowledge.committed',
  },
  Verification: {
    Completed: 'verification.completed',
  },
  Quality: {
    Failed: 'quality.failed',
  },
  Monitoring: {
    ProgressComputed: 'monitoring.progress',
  },
  Learning: {
    GapDetected: 'learning.gap',
  },
} as const;
