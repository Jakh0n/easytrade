import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Resurs topilmadi" });
}

interface MongoLikeError {
  name?: string;
  code?: number;
}

function resolveStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  const mongoError = error as MongoLikeError;

  if (mongoError.name === "CastError") {
    return 400;
  }

  if (mongoError.name === "ValidationError") {
    return 400;
  }

  if (mongoError.code === 11000) {
    return 409;
  }

  if (error instanceof Error && error.message.includes("topilmadi")) {
    return 400;
  }

  return 500;
}

function resolveMessage(error: unknown, statusCode: number): string {
  const mongoError = error as MongoLikeError;

  if (mongoError.name === "CastError") {
    return "Noto'g'ri identifikator";
  }

  if (mongoError.code === 11000) {
    return "Bunday yozuv allaqachon mavjud";
  }

  // Operational AppErrors carry safe, user-facing messages (e.g. rate limits),
  // so surface them even for 5xx. Only mask unexpected non-AppError failures.
  if (error instanceof AppError) {
    return error.message;
  }

  if (statusCode >= 500) {
    return "Serverda kutilmagan xato yuz berdi";
  }

  return error instanceof Error ? error.message : "Kutilmagan xato yuz berdi";
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const statusCode = resolveStatusCode(error);

  if (statusCode >= 500) {
    console.error("Server xatosi:", error);
  }

  res.status(statusCode).json({ error: resolveMessage(error, statusCode) });
}
