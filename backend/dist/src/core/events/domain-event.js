"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    payload;
    occurredAt = new Date().toISOString();
    constructor(payload) {
        this.payload = payload;
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.js.map