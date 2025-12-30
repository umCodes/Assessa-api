"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const express_1 = __importDefault(require("express"));
//Utilities
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
//Routes
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const file_routes_1 = __importDefault(require("./routes/file.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
//Middlewares
const error_handler_middlewares_1 = require("./middlewares/error-handler.middlewares");
const auth_handler_middlewares_1 = require("./middlewares/auth-handler.middlewares");
//Database
const db_1 = require("./db/db");
const clear_up_routes_1 = __importDefault(require("./routes/clear-up.routes"));
const env_1 = require("./constants/env");
//Cron
const refreshServer_1 = require("./cron/refreshServer");
const app = (0, express_1.default)();
(0, refreshServer_1.startRefreshCron)();
app.set('trust proxy', true);
app.use((0, cors_1.default)({ origin: env_1.ORIGIN, credentials: true }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_routes_1.default);
app.use(auth_handler_middlewares_1.refreshTokens, auth_handler_middlewares_1.authenticateToken);
app.use('/api', file_routes_1.default);
app.use('/api', clear_up_routes_1.default);
app.use('/api', quiz_routes_1.default);
app.use('/', user_routes_1.default);
app.use(error_handler_middlewares_1.errorHandler);
exports.database = (async () => {
    const db = await (0, db_1.connectToDB)();
    if (db)
        app.listen(env_1.PORT, () => console.log(`Server runnig on port ${env_1.PORT}`));
    return db;
})();
//# sourceMappingURL=index.js.map