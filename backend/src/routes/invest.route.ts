import { Router } from "express";
import {
  investHandler,
  investScreenerHandler,
} from "../controllers/invest.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  investBodySchema,
  investScreenerQuerySchema,
} from "../validators/market.validator.js";

const router = Router();

router.get(
  "/invest/screener",
  validate({ query: investScreenerQuerySchema }),
  asyncHandler(investScreenerHandler),
);

router.post(
  "/invest",
  validate({ body: investBodySchema }),
  asyncHandler(investHandler),
);

export default router;
