"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
async function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message;
    console.error(err);
    res.status(status).json({ message: message || "Internal Server Error", status: err.status });
}
//# sourceMappingURL=error-handler.middlewares.js.map