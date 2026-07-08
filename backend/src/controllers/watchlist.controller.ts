import type { Request, Response } from "express";
import { getUserId } from "../middleware/auth.js";
import {
  addWatchlistItem,
  listWatchlist,
  removeWatchlistItem,
} from "../services/watchlist.service.js";
import type { WatchlistAddBody } from "../validators/persist.validator.js";

export async function listWatchlistHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const items = await listWatchlist(getUserId(req));
  res.json({ items });
}

export async function addWatchlistHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const body = res.locals.body as WatchlistAddBody;
  const item = await addWatchlistItem(getUserId(req), body);
  res.status(201).json({ item });
}

export async function removeWatchlistHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await removeWatchlistItem(getUserId(req), String(req.params.id));
  res.status(204).send();
}
