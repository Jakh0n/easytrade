import { Router } from "express";
import {
  closeTradeHandler,
  createTradeHandler,
  deleteTradeHandler,
  journalStatsHandler,
  listTradesHandler,
} from "../controllers/journal.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  tradeCloseSchema,
  tradeCreateSchema,
} from "../validators/persist.validator.js";

const router = Router();

router.use("/journal", requireDatabase, requireAuth);

router.get("/journal/stats", asyncHandler(journalStatsHandler));
router.get("/journal", asyncHandler(listTradesHandler));
router.post(
  "/journal",
  validate({ body: tradeCreateSchema }),
  asyncHandler(createTradeHandler),
);
router.patch(
  "/journal/:id/close",
  validate({ body: tradeCloseSchema }),
  asyncHandler(closeTradeHandler),
);
router.delete("/journal/:id", asyncHandler(deleteTradeHandler));

export default router;
