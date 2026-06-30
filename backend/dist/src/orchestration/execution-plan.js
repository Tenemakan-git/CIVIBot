"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPlan = void 0;
class ExecutionPlan {
    queue;
    done = new Set();
    constructor(initial) {
        this.queue = [...initial];
    }
    next() {
        return this.queue.shift();
    }
    markDone(agent) {
        this.done.add(agent);
    }
    enqueue(agents, options = {}) {
        const toAdd = options.front ? [...agents].reverse() : agents;
        for (const a of toAdd) {
            if (this.queue.includes(a))
                continue;
            if (this.done.has(a)) {
                if (!options.allowRerun)
                    continue;
                this.done.delete(a);
            }
            if (options.front)
                this.queue.unshift(a);
            else
                this.queue.push(a);
        }
    }
    get pending() {
        return [...this.queue];
    }
}
exports.ExecutionPlan = ExecutionPlan;
//# sourceMappingURL=execution-plan.js.map