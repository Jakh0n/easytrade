import type { Request, Response } from "express";
import { runBacktest } from "../services/backtest.service.js";
import type { BacktestQuery } from "../validators/market.validator.js";

export async function backtestHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { symbol, interval, marketType } = res.locals.query as BacktestQuery;
  const summary = await runBacktest(symbol, interval, marketType);
  res.json(summary);
}
