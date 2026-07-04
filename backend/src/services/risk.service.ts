import type { RiskLevelsParams, RiskLevelsResult, Trend } from "../types/index.js";

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

export function calculateRiskLevels(params: RiskLevelsParams): RiskLevelsResult {
  const { currentPrice, atr, trend, capital, riskPercent } = params;

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    throw new Error("currentPrice musbat son bo'lishi kerak");
  }

  if (!Number.isFinite(atr) || atr < 0) {
    throw new Error("atr manfiy bo'lmasligi kerak");
  }

  if (!Number.isFinite(capital) || capital <= 0) {
    throw new Error("capital musbat son bo'lishi kerak");
  }

  if (!Number.isFinite(riskPercent) || riskPercent <= 0) {
    throw new Error("riskPercent musbat son bo'lishi kerak");
  }

  const stopDistance = 1.5 * atr;

  let stopLoss: number;
  let takeProfit: number;

  if (trend === "bearish") {
    stopLoss = currentPrice + stopDistance;
    const riskAmount = stopLoss - currentPrice;
    takeProfit = currentPrice - 2 * riskAmount;
  } else {
    stopLoss = currentPrice - stopDistance;
    const riskAmount = currentPrice - stopLoss;
    takeProfit = currentPrice + 2 * riskAmount;
  }

  const priceRisk = Math.abs(currentPrice - stopLoss);
  const reward = Math.abs(takeProfit - currentPrice);

  let positionSize = 0;
  let riskRewardRatio = 0;

  if (priceRisk === 0) {
    return {
      stopLoss,
      takeProfit,
      positionSize: 0,
      riskRewardRatio: 0,
      warning: "Stop loss narxi joriy narx bilan bir xil, ATR ni tekshiring",
    };
  }

  const riskAmountUsd = (capital * riskPercent) / 100;
  positionSize = riskAmountUsd / priceRisk;
  riskRewardRatio = reward / priceRisk;

  const result: RiskLevelsResult = {
    stopLoss,
    takeProfit,
    positionSize,
    riskRewardRatio,
  };

  if (positionSize * currentPrice > capital) {
    result.warning =
      "Position size kapitaldan oshib ketmoqda, risk% ni kamaytiring";
  }

  return result;
}
