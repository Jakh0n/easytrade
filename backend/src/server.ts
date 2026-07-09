import cors from "cors";
import express from "express";
import type { Server } from "node:http";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { startSchedulers, stopSchedulers } from "./config/scheduler.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import alertRouter from "./routes/alert.route.js";
import analyzeRouter from "./routes/analyze.route.js";
import authRouter from "./routes/auth.route.js";
import backtestRouter from "./routes/backtest.route.js";
import chatRouter from "./routes/chat.route.js";
import investRouter from "./routes/invest.route.js";
import journalRouter from "./routes/journal.route.js";
import screenerRouter from "./routes/screener.route.js";
import watchlistRouter from "./routes/watchlist.route.js";

const app = express();

const corsOrigin =
  env.CORS_ORIGIN === "*"
    ? true
    : env.CORS_ORIGIN.split(",").map((o) => o.trim());

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRouter);
app.use("/api", analyzeRouter);
app.use("/api", screenerRouter);
app.use("/api", backtestRouter);
app.use("/api", watchlistRouter);
app.use("/api", journalRouter);
app.use("/api", alertRouter);
app.use("/api", chatRouter);
app.use("/api", investRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  await connectDatabase();
  startSchedulers();

  const server = app.listen(env.PORT, () => {
    console.log(`Server ishga tushdi: http://localhost:${env.PORT}`);
  });

  registerShutdown(server);
}

/** Closes the HTTP server, cron tasks and DB so `tsx watch` restarts cleanly. */
function registerShutdown(server: Server): void {
  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;

    stopSchedulers();
    server.close();

    try {
      await disconnectDatabase();
    } catch {
      // Ignore disconnect errors during shutdown.
    }

    process.exit(signal === "SIGINT" ? 130 : 0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

void start();
