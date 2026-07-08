import { Router } from "express";
import { buildTechnicalAnalysis } from "../services/analysis.service.js";
import { generateAnalysis } from "../services/openai.service.js";
import type { AnalyzeRequestBody } from "../types/index.js";

const router = Router();

const DEFAULT_CAPITAL = 10_000;
const DEFAULT_RISK_PERCENT = 2;
const DEFAULT_INTERVAL = "4h";

router.post("/analyze", async (req, res) => {
  try {
    const {
      symbol,
      capital = DEFAULT_CAPITAL,
      riskPercent = DEFAULT_RISK_PERCENT,
      interval = DEFAULT_INTERVAL,
      marketType = "spot",
    } = req.body as AnalyzeRequestBody;

    if (!symbol || typeof symbol !== "string") {
      res
        .status(400)
        .json({ error: "symbol majburiy va string bo'lishi kerak" });
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

    const analysis = await buildTechnicalAnalysis(
      symbol,
      interval,
      capital,
      riskPercent,
      marketType,
    );

    const aiAnalysis = await generateAnalysis({
      symbol: analysis.symbol,
      currentPrice: analysis.currentPrice,
      trend: analysis.trend,
      marketType: analysis.marketType,
      indicators: analysis.indicators,
      risk: {
        stopLoss: analysis.risk.stopLoss,
        takeProfit: analysis.risk.takeProfit,
        positionSize: analysis.risk.positionSize,
        riskRewardRatio: analysis.risk.riskRewardRatio,
      },
      strategy: analysis.strategy,
      verdict: {
        verdict: analysis.verdict.verdict,
        verdictLabel: analysis.verdict.verdictLabel,
        side: analysis.verdict.side,
        headline: analysis.verdict.headline,
        reason: analysis.verdict.reason,
        rrNow: analysis.verdict.rrNow,
        rrIdeal: analysis.verdict.rrIdeal,
        entryZone: analysis.verdict.entryZone,
        invalidation: analysis.verdict.invalidation,
        stopLoss: analysis.verdict.stopLoss,
        takeProfit: analysis.verdict.takeProfit,
      },
    });

    res.json({
      ...analysis,
      risk: analysis.risk,
      analysis: aiAnalysis,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kutilmagan xato yuz berdi";

    const status = message.includes("Symbol topilmadi") ? 400 : 500;

    res.status(status).json({ error: message });
  }
});

export default router;
