/**
 * Value Object : statut du dossier et transitions autorisées.
 * Centralise l'invariant « on ne saute pas d'étape » du cycle de vie.
 */
export enum FolderStatus {
  Ouvert = 'ouvert',
  EnCours = 'en_cours',
  Complet = 'complet',
  Termine = 'termine',
}

const TRANSITIONS: Record<FolderStatus, FolderStatus[]> = {
  // Un dossier neuf peut être complété en une seule passe (ouvert → complet).
  [FolderStatus.Ouvert]: [
    FolderStatus.EnCours,
    FolderStatus.Complet,
    FolderStatus.Termine,
  ],
  [FolderStatus.EnCours]: [
    FolderStatus.Complet,
    FolderStatus.Ouvert,
    FolderStatus.Termine,
  ],
  [FolderStatus.Complet]: [FolderStatus.Termine, FolderStatus.EnCours],
  [FolderStatus.Termine]: [],
};

export function canTransition(from: FolderStatus, to: FolderStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function assertValidStatus(value: string): FolderStatus {
  if (!Object.values(FolderStatus).includes(value as FolderStatus)) {
    throw new Error(`Statut de dossier invalide: ${value}`);
  }
  return value as FolderStatus;
}
