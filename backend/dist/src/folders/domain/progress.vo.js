"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
class Progress {
    value;
    constructor(value) {
        this.value = value;
    }
    static of(n) {
        const clamped = Math.max(0, Math.min(100, Math.round(n)));
        return new Progress(clamped);
    }
    static zero() {
        return new Progress(0);
    }
    static fromRatio(done, total) {
        if (total <= 0)
            return Progress.zero();
        return Progress.of((done / total) * 100);
    }
    isComplete() {
        return this.value >= 100;
    }
}
exports.Progress = Progress;
//# sourceMappingURL=progress.vo.js.map