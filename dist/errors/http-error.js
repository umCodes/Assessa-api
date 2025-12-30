"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = "HttpError";
        this.message = message;
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=http-error.js.map