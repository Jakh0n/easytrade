import { Router } from "express";
import { chatHandler } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { chatBodySchema } from "../validators/chat.validator.js";

const router = Router();

router.post(
  "/chat",
  requireAuth,
  validate({ body: chatBodySchema }),
  chatHandler,
);

export default router;
