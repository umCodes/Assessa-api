import cron from "node-cron";

const SERVER_URL = process.env.SERVER_URL!;

export function startRefreshCron() {
  // Every 10 minutes
  //cron.schedule("*/10 * * * *", async () => {
    //try {
      //const res = await fetch(SERVER_URL);
      //console.log(`[CRON] Server pinged: ${res.status}`);
    //} catch (err) {
      //console.error("[CRON] Ping failed:", err);
    //}
  //});
}
