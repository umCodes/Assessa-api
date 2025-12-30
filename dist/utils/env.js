"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDBName = exports.mongoURI = exports.tokenAge = exports.signatures = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.signatures = {
    accessToken: String(process.env.ACCESS_TOKEN_SIGNATURE),
    refreshToken: String(process.env.REFRESH_TOKEN_SIGNATURE),
    tokensStorage: String(process.env.TOKENS_STORAGE_SIGNATURE)
};
exports.tokenAge = {
    access: 20 * 60 * 1000,
    refresh: 7 * 24 * 60 * 60 * 1000
};
exports.mongoURI = String(process.env.MONGO_URI);
exports.mongoDBName = String(process.env.MONGO_DB_NAME);
//# sourceMappingURL=env.js.map