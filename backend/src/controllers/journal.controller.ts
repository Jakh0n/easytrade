import type { Request, Response } from "express";
import { getUserId } from "../middleware/auth.js";
import {
  closeTrade,
  createTrade,
  deleteTrade,
  getJournalStats,
  listTrades,
} from "../services/journal.service.js";
import type {
  TradeCloseBody,
  TradeCreateBody,
} from "../validators/persist.validator.js";

export async function listTradesHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const trades = await listTrades(getUserId(req), status);
  res.json({ trades });
}

export async function createTradeHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const body = res.locals.body as TradeCreateBody;
  const trade = await createTrade(getUserId(req), body);
  res.status(201).json({ trade });
}

export async function closeTradeHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const body = res.locals.body as TradeCloseBody;
  const trade = await closeTrade(getUserId(req), String(req.params.id), body);
  res.json({ trade });
}

export async function deleteTradeHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await deleteTrade(getUserId(req), String(req.params.id));
  res.status(204).send();
}

export async function journalStatsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const stats = await getJournalStats(getUserId(req));
  res.json(stats);
}
