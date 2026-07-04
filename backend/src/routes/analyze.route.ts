import { Router } from "express";
import { getKlines } from "../services/binance.service.js";
import {
  calculateATR,
  calculateEMA,
  calculateRSI,
  findSupportResistance,
  getVolumeStatus,
} from "../services/indicators.service.js";
import { generateAnalysis } from "../services/openai.service.js";
import {
  calculateRiskLevels,
  determineTrend,
} from "../services/risk.service.js";
import type { AnalyzeRequestBody } from "../types/index.js";

const router = Router();

const DEFAULT_CAPITAL = 10_000;
const DEFAULT_RISK_PERCENT = 2;
const DEFAULT_INTERVAL = "4h";
const KLINE_LIMIT = 300;

function getLastEma(emaValues: number[]): number {
  const lastValue = emaValues[emaValues.length - 1];

  if (lastValue === undefined || Number.isNaN(lastValue)) {
    throw new Error("EMA hisoblash uchun yetarli ma'lumot yo'q");
  }

  return lastValue;
}

router.post("/analyze", async (req, res) => {
  try {
    const {
      symbol,
      capital = DEFAULT_CAPITAL,
      riskPercent = DEFAULT_RISK_PERCENT,
      interval = DEFAULT_INTERVAL,
    } = req.body as AnalyzeRequestBody;

    if (!symbol || typeof symbol !== "string") {
      res.status(400).json({ error: "symbol majburiy va string bo'lishi kerak" });
      return;
    }

    if (!Number.isFinite(capital) || capital <= 0) {
      res.status(400).json({ error: "capital musbat son bo'lishi kerak" });
      return;
    }

    if (!Number.isFinite(riskPercent) || riskPercent <= 0) {
      res.status(400).json({ error: "riskPercent musbat son bo'lishi kerak" });
      return;
    }

    const normalizedSymbol = symbol.toUpperCase();
    const candles = await getKlines(normalizedSymbol, interval, KLINE_LIMIT);
    const closes = candles.map((candle) => candle.close);
    const currentPrice = closes[closes.length - 1]!;

    const ema50 = getLastEma(calculateEMA(closes, 50));
    const ema200 = getLastEma(calculateEMA(closes, 200));
    const rsi = calculateRSI(closes, 14);
    const atr = calculateATR(candles, 14);
    const { support, resistance } = findSupportResistance(candles, 30);
    const volumeStatus = getVolumeStatus(candles);

    const trend = determineTrend(ema50, ema200, currentPrice);
    const risk = calculateRiskLevels({
      currentPrice,
      atr,
      trend,
      capital,
      riskPercent,
    });

    const analysis = await generateAnalysis({
      symbol: normalizedSymbol,
      currentPrice,
      trend,
      indicators: {
        ema50,
        ema200,
        rsi,
        atr,
        support,
        resistance,
        volumeStatus,
      },
      risk: {
        stopLoss: risk.stopLoss,
        takeProfit: risk.takeProfit,
        positionSize: risk.positionSize,
        riskRewardRatio: risk.riskRewardRatio,
      },
    });

    res.json({
      symbol: normalizedSymbol,
      interval,
      currentPrice,
      trend,
      indicators: {
        ema50,
        ema200,
        rsi,
        atr,
        support,
        resistance,
        volumeStatus,
      },
      risk: {
        stopLoss: risk.stopLoss,
        takeProfit: risk.takeProfit,
        positionSize: risk.positionSize,
        riskRewardRatio: risk.riskRewardRatio,
        warning: risk.warning,
      },
      analysis,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kutilmagan xato yuz berdi";

    const status = message.includes("Symbol topilmadi") ? 400 : 500;

    res.status(status).json({ error: message });
  }
});

export default router;
