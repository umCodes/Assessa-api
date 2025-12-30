"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieHandler = cookieHandler;
async function cookieHandler(req, res, next) {
    console.log(req.cookies);
    next();
}
//# sourceMappingURL=cookie-handler.middlewares.js.map