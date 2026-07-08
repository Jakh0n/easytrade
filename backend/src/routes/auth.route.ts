import { Router } from "express";
import {
  loginHandler,
  meHandler,
  registerHandler,
  updateSettingsHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  loginSchema,
  registerSchema,
  settingsSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.use(requireDatabase);

router.post(
  "/auth/register",
  validate({ body: registerSchema }),
  asyncHandler(registerHandler),
);

router.post(
  "/auth/login",
  validate({ body: loginSchema }),
  asyncHandler(loginHandler),
);

router.get("/auth/me", requireAuth, asyncHandler(meHandler));

router.patch(
  "/auth/settings",
  requireAuth,
  validate({ body: settingsSchema }),
  asyncHandler(updateSettingsHandler),
);

export default router;
