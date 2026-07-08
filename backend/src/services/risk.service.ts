import type {
  PositionSizingParams,
  PositionSizingResult,
  Trend,
} from "../types/index.js";

export function determineTrend(
  ema50: number,
  ema200: number,
  currentPrice: number,
): Trend {
  if (
    !Number.isFinite(ema50) ||
    !Number.isFinite(ema200) ||
    !Number.isFinite(currentPrice)
  ) {
    return "neutral";
  }

  if (ema50 > ema200 && currentPrice > ema50) {
    return "bullish";
  }

  if (ema50 < ema200 && currentPrice < ema50) {
    return "bearish";
  }

  return "neutral";
}

/**
 * Position sizing from the setup's own stop-loss. The stop-loss is decided by the
 * strategy verdict (side-aware, anchored to the invalidation level), so sizing
 * always reflects the real risk of the proposed trade.
 */
export function computePositionSizing(
  params: PositionSizingParams,
): PositionSizingResult {
  const { currentPrice, stopLoss, capital, riskPercent } = params;

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    throw new Error("currentPrice musbat son bo'lishi kerak");
  }

  if (!Number.isFinite(stopLoss) || stopLoss <= 0) {
    throw new Error("stopLoss musbat son bo'lishi kerak");
  }

  if (!Number.isFinite(capital) || capital <= 0) {
    throw new Error("capital musbat son bo'lishi kerak");
  }

  if (!Number.isFinite(riskPercent) || riskPercent <= 0) {
    throw new Error("riskPercent musbat son bo'lishi kerak");
  }

  const priceRisk = Math.abs(currentPrice - stopLoss);

  if (priceRisk === 0) {
    return {
      positionSize: 0,
      warning: "Stop loss narxi joriy narx bilan bir xil, ATR ni tekshiring",
    };
  }

  const riskAmountUsd = (capital * riskPercent) / 100;
  const positionSize = riskAmountUsd / priceRisk;

  const result: PositionSizingResult = { positionSize };

  if (positionSize * currentPrice > capital) {
    result.warning =
      "Position size kapitaldan oshib ketmoqda, risk% ni kamaytiring";
  }

  return result;
}
