import { Router } from "express";
import { screenerHandler } from "../controllers/screener.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { screenerQuerySchema } from "../validators/market.validator.js";

const router = Router();

router.get(
  "/screener",
  validate({ query: screenerQuerySchema }),
  asyncHandler(screenerHandler),
);

export default router;
