export declare const Events: {
    readonly Folder: {
        readonly Created: "folder.created";
        readonly Updated: "folder.updated";
        readonly Completed: "folder.completed";
    };
    readonly Checklist: {
        readonly ItemToggled: "checklist.item.toggled";
    };
    readonly Knowledge: {
        readonly InsufficientLocal: "knowledge.insufficient";
        readonly CandidatesReady: "knowledge.candidates.ready";
        readonly Committed: "knowledge.committed";
    };
    readonly Verification: {
        readonly Completed: "verification.completed";
    };
    readonly Quality: {
        readonly Failed: "quality.failed";
    };
    readonly Monitoring: {
        readonly ProgressComputed: "monitoring.progress";
    };
    readonly Learning: {
        readonly GapDetected: "learning.gap";
    };
};
