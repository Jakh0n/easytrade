import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/token.js";

/** Requires a valid Bearer JWT and attaches the resolved userId to the request. */
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError("Avtorizatsiya talab qilinadi", 401));
    return;
  }

  try {
    const { userId } = verifyToken(header.slice(7));
    req.userId = userId;
    next();
  } catch {
    next(new AppError("Token yaroqsiz yoki muddati tugagan", 401));
  }
}

/** Resolves the authenticated userId or throws (for use inside controllers). */
export function getUserId(req: Request): string {
  if (!req.userId) {
    throw new AppError("Avtorizatsiya talab qilinadi", 401);
  }
  return req.userId;
}
