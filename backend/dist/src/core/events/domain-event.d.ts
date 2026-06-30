export declare abstract class DomainEvent<TPayload = unknown> {
    readonly payload: TPayload;
    readonly occurredAt: string;
    abstract readonly name: string;
    constructor(payload: TPayload);
}
