/**
 * Type Result fonctionnel : modélise succès/échec sans exception, pour les
 * flux où l'échec est une donnée métier (validation, parsing, pipeline).
 */
export type Outcome<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Outcome<T, never> => ({ ok: true, value });
export const fail = <E>(error: E): Outcome<never, E> => ({ ok: false, error });

export const isOk = <T, E>(o: Outcome<T, E>): o is { ok: true; value: T } =>
  o.ok;
