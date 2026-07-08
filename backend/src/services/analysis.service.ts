import { getKlines } from "./binance.service.js";
import {
  calculateATR,
  calculateEMA,
  calculateRSI,
  findSupportResistance,
  getVolumeStatus,
} from "./indicators.service.js";
import { computePositionSizing, determineTrend } from "./risk.service.js";
import {
  buildStrategyVerdict,
  type StrategyDetection,
  type VerdictResult,
} from "./strategy.service.js";
import type { MarketType, Trend, VolumeStatus } from "../types/index.js";

const KLINE_LIMIT = 300;

function getLastEma(emaValues: number[]): number {
  const lastValue = emaValues[emaValues.length - 1];

  if (lastValue === undefined || Number.isNaN(lastValue)) {
    throw new Error("EMA hisoblash uchun yetarli ma'lumot yo'q");
  }

  return lastValue;
}

export interface TechnicalAnalysis {
  symbol: string;
  interval: string;
  marketType: MarketType;
  currentPrice: number;
  trend: Trend;
  indicators: {
    ema50: number;
    ema200: number;
    rsi: number;
    atr: number;
    support: number;
    resistance: number;
    volumeStatus: VolumeStatus;
  };
  risk: {
    stopLoss: number;
    takeProfit: number;
    positionSize: number;
    riskRewardRatio: number;
    warning?: string;
  };
  strategy: StrategyDetection;
  verdict: VerdictResult;
}

export async function buildTechnicalAnalysis(
  symbol: string,
  interval: string = "4h",
  capital: number = 10_000,
  riskPercent: number = 2,
  marketType: MarketType = "spot",
): Promise<TechnicalAnalysis> {
  const normalizedSymbol = symbol.toUpperCase();
  const candles = await getKlines(
    normalizedSymbol,
    interval,
    KLINE_LIMIT,
    marketType,
  );
  const closes = candles.map((candle) => candle.close);
  const currentPrice = closes[closes.length - 1]!;

  const ema50 = getLastEma(calculateEMA(closes, 50));
  const ema200 = getLastEma(calculateEMA(closes, 200));
  const rsi = calculateRSI(closes, 14);
  const atr = calculateATR(candles, 14);
  const { support, resistance } = findSupportResistance(candles, 30);
  const volumeStatus = getVolumeStatus(candles);
  const trend = determineTrend(ema50, ema200, currentPrice);

  const indicators = {
    ema50,
    ema200,
    rsi,
    atr,
    support,
    resistance,
    volumeStatus,
  };

  const verdict = buildStrategyVerdict({
    candles,
    currentPrice,
    trend,
    indicators,
    marketType,
  });

  const sizing = computePositionSizing({
    currentPrice,
    stopLoss: verdict.stopLoss,
    capital,
    riskPercent,
  });

  return {
    symbol: normalizedSymbol,
    interval,
    marketType,
    currentPrice,
    trend,
    indicators,
    risk: {
      stopLoss: verdict.stopLoss,
      takeProfit: verdict.takeProfit,
      positionSize: sizing.positionSize,
      riskRewardRatio: verdict.rrIdeal,
      warning: sizing.warning,
    },
    strategy: verdict.strategy,
    verdict,
  };
}
