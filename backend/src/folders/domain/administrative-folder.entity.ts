import { Domain } from '../../core/agent/domain.enum';
import {
  FolderStatus,
  assertValidStatus,
  canTransition,
} from './folder-status.vo';
import { Progress } from './progress.vo';

/** Forme de persistance plate (mappée par le repository). */
export interface FolderSnapshot {
  id: string;
  userId: string;
  domaine: string;
  procedureSlug: string | null;
  titre: string;
  statut: string;
  progression: number;
  conversationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFolderProps {
  id?: string;
  userId: string;
  domaine: Domain;
  titre: string;
  procedureSlug?: string | null;
  conversationId?: string | null;
}

/**
 * Aggregate root du bounded context "AdministrativeFolder".
 * Porte les invariants du dossier (statut, progression) ; les collections
 * (timeline, documents, notifications…) sont gérées via le repository pour
 * éviter de charger l'agrégat entier à chaque opération.
 */
export class AdministrativeFolder {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    private _domaine: Domain,
    private _titre: string,
    private _procedureSlug: string | null,
    private _statut: FolderStatus,
    private _progression: Progress,
    private _conversationId: string | null,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ── Création ──
  static create(props: CreateFolderProps): AdministrativeFolder {
    const now = new Date();
    return new AdministrativeFolder(
      props.id ?? crypto.randomUUID(),
      props.userId,
      props.domaine,
      props.titre,
      props.procedureSlug ?? null,
      FolderStatus.Ouvert,
      Progress.zero(),
      props.conversationId ?? null,
      now,
      now,
    );
  }

  // ── Réhydratation depuis la persistance ──
  static fromSnapshot(s: FolderSnapshot): AdministrativeFolder {
    return new AdministrativeFolder(
      s.id,
      s.userId,
      s.domaine as Domain,
      s.titre,
      s.procedureSlug,
      assertValidStatus(s.statut),
      Progress.of(s.progression),
      s.conversationId,
      s.createdAt,
      s.updatedAt,
    );
  }

  // ── Accesseurs ──
  get domaine(): Domain {
    return this._domaine;
  }
  get titre(): string {
    return this._titre;
  }
  get procedureSlug(): string | null {
    return this._procedureSlug;
  }
  get statut(): FolderStatus {
    return this._statut;
  }
  get progression(): number {
    return this._progression.value;
  }
  get conversationId(): string | null {
    return this._conversationId;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ── Comportements (invariants) ──
  rename(titre: string): void {
    if (!titre.trim()) throw new Error('Le titre du dossier ne peut être vide');
    this._titre = titre.trim();
    this.touch();
  }

  attachConversation(conversationId: string): void {
    this._conversationId = conversationId;
    this.touch();
  }

  setProcedure(slug: string): void {
    this._procedureSlug = slug;
    this.touch();
  }

  /**
   * Met à jour la progression et fait évoluer le statut en conséquence :
   * 0 → reste/Ouvert ; >0 → EnCours ; 100 → Complet. Le passage à Termine
   * reste explicite (`terminate`).
   */
  updateProgress(value: number): void {
    this._progression = Progress.of(value);
    if (this._statut === FolderStatus.Termine) return;

    if (this._progression.isComplete()) {
      this.transitionTo(FolderStatus.Complet);
    } else if (this._progression.value > 0) {
      this.transitionTo(FolderStatus.EnCours);
    }
    this.touch();
  }

  terminate(): void {
    this.transitionTo(FolderStatus.Termine);
    this.touch();
  }

  transitionTo(status: FolderStatus): void {
    if (!canTransition(this._statut, status)) {
      throw new Error(
        `Transition de statut interdite: ${this._statut} → ${status}`,
      );
    }
    this._statut = status;
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  toSnapshot(): FolderSnapshot {
    return {
      id: this.id,
      userId: this.userId,
      domaine: this._domaine,
      procedureSlug: this._procedureSlug,
      titre: this._titre,
      statut: this._statut,
      progression: this._progression.value,
      conversationId: this._conversationId,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
