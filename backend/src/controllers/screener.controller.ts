import type { Request, Response } from "express";
import { runMarketScreener } from "../services/screener.service.js";
import type { MarketType } from "../types/index.js";

interface ScreenerQuery {
  interval: string;
  marketType: MarketType;
  limit: number;
}

export async function screenerHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { interval, marketType, limit } = res.locals.query as ScreenerQuery;
  const result = await runMarketScreener(interval, limit, marketType);
  res.json(result);
}
