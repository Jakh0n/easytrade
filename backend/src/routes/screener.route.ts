import { Router } from "express";
import { runMarketScreener } from "../services/screener.service.js";

const router = Router();

router.get("/screener", async (req, res) => {
  try {
    const interval =
      typeof req.query.interval === "string" ? req.query.interval : "4h";
    const marketType =
      req.query.marketType === "futures" ? "futures" : "spot";
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const result = await runMarketScreener(interval, limit, marketType);
    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Screener xatosi yuz berdi";
    res.status(500).json({ error: message });
  }
});

export default router;
