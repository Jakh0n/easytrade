import { Router } from "express";
import {
  addWatchlistHandler,
  listWatchlistHandler,
  removeWatchlistHandler,
} from "../controllers/watchlist.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireDatabase } from "../middleware/requireDatabase.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { watchlistAddSchema } from "../validators/persist.validator.js";

const router = Router();

router.use("/watchlist", requireDatabase, requireAuth);

router.get("/watchlist", asyncHandler(listWatchlistHandler));
router.post(
  "/watchlist",
  validate({ body: watchlistAddSchema }),
  asyncHandler(addWatchlistHandler),
);
router.delete("/watchlist/:id", asyncHandler(removeWatchlistHandler));

export default router;
