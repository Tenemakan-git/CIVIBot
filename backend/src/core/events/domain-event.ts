/**
 * Base des événements de domaine diffusés sur le bus (@nestjs/event-emitter).
 * Consommés par les agents réactifs (Monitoring, Notification, Learning),
 * jamais dans le chemin synchrone d'une requête.
 */
export abstract class DomainEvent<TPayload = unknown> {
  readonly occurredAt: string = new Date().toISOString();
  abstract readonly name: string;
  constructor(public readonly payload: TPayload) {}
}
