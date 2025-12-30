"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRefreshCron = startRefreshCron;
const node_cron_1 = __importDefault(require("node-cron"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const SERVER_URL = process.env.SERVER_URL;
function startRefreshCron() {
    // Every 10 minutes
    node_cron_1.default.schedule("*/10 * * * *", async () => {
        try {
            const res = await (0, node_fetch_1.default)(SERVER_URL);
            console.log(`[CRON] Server pinged: ${res.status}`);
        }
        catch (err) {
            console.error("[CRON] Ping failed:", err);
        }
    });
}
//# sourceMappingURL=refreshServer.js.map