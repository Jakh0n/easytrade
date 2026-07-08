import type { NextFunction, Request, Response } from "express";
import { isDatabaseConnected } from "../config/db.js";
import { AppError } from "../utils/AppError.js";

/**
 * Short-circuits requests that need MongoDB when it is unreachable, returning a
 * clear 503 instead of letting queries fail with a generic 500.
 */
export function requireDatabase(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!isDatabaseConnected()) {
    next(
      new AppError(
        "Ma'lumotlar bazasi ulanmagan. Iltimos, birozdan so'ng urinib ko'ring.",
        503,
      ),
    );
    return;
  }

  next();
}
