"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = validateInput;
const http_error_1 = require("../errors/http-error");
function validateInput(email, password) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new http_error_1.HttpError("Email entered is invalid.", 400);
    }
    if (!/^^(?=.*[A-Za-z]).{8,}$/.test(password)) {
        throw new http_error_1.HttpError("Password must be at least 8 characters long and contain at least one letter.", 400);
    }
    return true;
}
//# sourceMappingURL=auth.js.map