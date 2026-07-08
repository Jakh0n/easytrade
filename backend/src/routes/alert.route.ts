import { Router } from "express";
import {
  createAlertHandler,
  deleteAlertHandler,
  listAlertsHandler,
} from "../controllers/alert.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { alertCreateSchema } from "../validators/persist.validator.js";

const router = Router();

router.use("/alerts", requireDatabase, requireAuth);

router.get("/alerts", asyncHandler(listAlertsHandler));
router.post(
  "/alerts",
  validate({ body: alertCreateSchema }),
  asyncHandler(createAlertHandler),
);
router.delete("/alerts/:id", asyncHandler(deleteAlertHandler));

export default router;
