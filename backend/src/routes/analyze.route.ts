import { Router } from "express";
import {
  analyzeHandler,
  analyzeSummaryHandler,
} from "../controllers/analyze.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeBodySchema } from "../validators/market.validator.js";

const router = Router();

router.post(
  "/analyze",
  validate({ body: analyzeBodySchema }),
  asyncHandler(analyzeHandler),
);

router.post(
  "/analyze/summary",
  validate({ body: analyzeBodySchema }),
  analyzeSummaryHandler,
);

export default router;
