"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDBName = exports.mongoURI = exports.geminiApiKey = exports.openRouterApiKey = exports.PORT = exports.tokenAge = exports.llmModels = exports.ORIGIN = exports.signature = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.signature = {
    accessToken: String(process.env.ACCESS_TOKEN_SIGNATURE),
    refreshToken: String(process.env.REFRESH_TOKEN_SIGNATURE)
};
exports.ORIGIN = process.env.ORIGIN;
exports.llmModels = {
    deepseek_r1: 'deepseek/deepseek-r1:free',
};
exports.tokenAge = {
    accessToken: 60 * 25,
    refreshToken: 60 * 60 * 4,
};
exports.PORT = Number(process.env.PORT);
exports.openRouterApiKey = String(process.env.OPEN_ROUTER_API_KEY);
exports.geminiApiKey = String(process.env.GEMINI_API_KEY);
exports.mongoURI = String(process.env.MONGO_URI);
exports.mongoDBName = String(process.env.MONGO_DB_NAME);
//# sourceMappingURL=env.js.map