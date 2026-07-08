import type { Request, Response } from "express";
import { getUserId } from "../middleware/auth.js";
import {
  createAlert,
  deleteAlert,
  listAlerts,
} from "../services/alert.service.js";
import type { AlertCreateBody } from "../validators/persist.validator.js";

export async function listAlertsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const alerts = await listAlerts(getUserId(req), status);
  res.json({ alerts });
}

export async function createAlertHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const body = res.locals.body as AlertCreateBody;
  const alert = await createAlert(getUserId(req), body);
  res.status(201).json({ alert });
}

export async function deleteAlertHandler(
  req: Request,
  res: Response,
): Promise<void> {
  await deleteAlert(getUserId(req), String(req.params.id));
  res.status(204).send();
}
