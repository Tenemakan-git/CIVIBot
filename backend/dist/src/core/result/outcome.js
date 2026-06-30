"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOk = exports.fail = exports.ok = void 0;
const ok = (value) => ({ ok: true, value });
exports.ok = ok;
const fail = (error) => ({ ok: false, error });
exports.fail = fail;
const isOk = (o) => o.ok;
exports.isOk = isOk;
//# sourceMappingURL=outcome.js.map