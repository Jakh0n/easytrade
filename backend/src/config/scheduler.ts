import cron, { type ScheduledTask } from "node-cron";
import { evaluateAlerts } from "../services/alert.service.js";
import { isDatabaseConnected } from "./db.js";

const ALERT_CRON = "* * * * *"; // every minute

let alertTask: ScheduledTask | null = null;

export function startSchedulers(): void {
  alertTask = cron.schedule(ALERT_CRON, () => {
    if (!isDatabaseConnected()) {
      return;
    }

    void evaluateAlerts().catch((error) => {
      console.error(
        "Alert baholash xatosi:",
        error instanceof Error ? error.message : error,
      );
    });
  });
}

export function stopSchedulers(): void {
  alertTask?.stop();
  alertTask = null;
}
