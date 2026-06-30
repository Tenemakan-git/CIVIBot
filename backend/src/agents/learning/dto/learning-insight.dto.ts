export class LearningInsightDto {
  type!: string;
  cle!: string;
  domaine!: string | null;
  count!: number;
  recommandation!: string | null;
  lastSeen!: Date;
}
