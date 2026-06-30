"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
exports.Events = {
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
};
//# sourceMappingURL=event-names.js.map