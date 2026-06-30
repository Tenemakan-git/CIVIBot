"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationPipe = void 0;
const common_1 = require("@nestjs/common");
exports.validationPipe = new common_1.ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
});
//# sourceMappingURL=validation.pipe.js.map