import type { Request, Response } from "express";
import { getUserId } from "../middleware/auth.js";
import {
  getUserProfile,
  loginUser,
  registerUser,
  updateUserSettings,
} from "../services/auth.service.js";
import type {
  LoginBody,
  RegisterBody,
  SettingsBody,
} from "../validators/auth.validator.js";

export async function registerHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { email, password, name } = res.locals.body as RegisterBody;
  const result = await registerUser(email, password, name);
  res.status(201).json(result);
}

export async function loginHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { email, password } = res.locals.body as LoginBody;
  const result = await loginUser(email, password);
  res.json(result);
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const user = await getUserProfile(getUserId(req));
  res.json({ user });
}

export async function updateSettingsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const settings = res.locals.body as SettingsBody;
  const user = await updateUserSettings(getUserId(req), settings);
  res.json({ user });
}
