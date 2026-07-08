import { Router } from "express";
import { backtestHandler } from "../controllers/backtest.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { backtestQuerySchema } from "../validators/market.validator.js";

const router = Router();

router.get(
  "/backtest",
  validate({ query: backtestQuerySchema }),
  asyncHandler(backtestHandler),
);

export default router;
