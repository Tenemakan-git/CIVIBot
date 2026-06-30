/**
 * Value Object : progression bornée 0..100, immuable.
 */
export class Progress {
  private constructor(public readonly value: number) {}

  static of(n: number): Progress {
    const clamped = Math.max(0, Math.min(100, Math.round(n)));
    return new Progress(clamped);
  }

  static zero(): Progress {
    return new Progress(0);
  }

  /** Progression dérivée d'un ratio terminé/total. */
  static fromRatio(done: number, total: number): Progress {
    if (total <= 0) return Progress.zero();
    return Progress.of((done / total) * 100);
  }

  isComplete(): boolean {
    return this.value >= 100;
  }
}
