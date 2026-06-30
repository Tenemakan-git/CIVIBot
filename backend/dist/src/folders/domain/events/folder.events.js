"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderCompletedEvent = exports.FolderUpdatedEvent = exports.FolderCreatedEvent = void 0;
const domain_event_1 = require("../../../core/events/domain-event");
const event_names_1 = require("../../../core/events/event-names");
class FolderCreatedEvent extends domain_event_1.DomainEvent {
    name = event_names_1.Events.Folder.Created;
}
exports.FolderCreatedEvent = FolderCreatedEvent;
class FolderUpdatedEvent extends domain_event_1.DomainEvent {
    name = event_names_1.Events.Folder.Updated;
}
exports.FolderUpdatedEvent = FolderUpdatedEvent;
class FolderCompletedEvent extends domain_event_1.DomainEvent {
    name = event_names_1.Events.Folder.Completed;
}
exports.FolderCompletedEvent = FolderCompletedEvent;
//# sourceMappingURL=folder.events.js.map