"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const common_1 = require("@nestjs/common");
class BaseAgent {
    logger = new common_1.Logger(this.constructor.name);
    async execute(ctx) {
        const start = Date.now();
        try {
            const out = await this.run(ctx);
            return {
                agent: this.name,
                status: out.status ?? 'success',
                data: out.data,
                confidence: out.confidence ?? 1,
                followups: out.followups,
                sources: out.sources,
                warnings: out.warnings,
                durationMs: Date.now() - start,
            };
        }
        catch (err) {
            const error = err;
            this.logger.error(`Agent "${this.name}" a échoué: ${error.message}`, error.stack);
            return {
                agent: this.name,
                status: 'failed',
                data: undefined,
                confidence: 0,
                errors: [error.message],
                durationMs: Date.now() - start,
            };
        }
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base-agent.abstract.js.map