import type { Request, Response } from "express";
import { buildInvestAnalysis } from "../services/invest.service.js";
import { runInvestScreener } from "../services/invest-screener.service.js";
import type { InvestBody } from "../validators/market.validator.js";
import type { InvestScreenerQuery } from "../validators/market.validator.js";

export async function investHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { symbol, capital, horizon } = res.locals.body as InvestBody;
  const analysis = await buildInvestAnalysis(symbol, capital, horizon);
  res.json(analysis);
}

export async function investScreenerHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { horizon, limit } = res.locals.query as InvestScreenerQuery;
  const response = await runInvestScreener(horizon, limit);
  res.json(response);
}
