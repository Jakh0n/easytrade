import type { Request, Response } from "express";
import { buildTechnicalAnalysis } from "../services/analysis.service.js";
import {
  isOpenAiConfigured,
  streamAnalysis,
} from "../services/openai.service.js";
import type { AnalysisInput, AnalyzeRequestBody } from "../types/index.js";

const AI_UNAVAILABLE_MESSAGE =
  "AI izoh hozircha mavjud emas. Texnik signal va risk darajalari to'liq hisoblangan.";

function toAnalysisInput(
  analysis: Awaited<ReturnType<typeof buildTechnicalAnalysis>>,
): AnalysisInput {
  return {
    symbol: analysis.symbol,
    currentPrice: analysis.currentPrice,
    trend: analysis.trend,
    marketType: analysis.marketType,
    indicators: analysis.indicators,
    risk: analysis.risk,
    strategy: analysis.strategy,
    verdict: analysis.verdict,
  };
}

export async function analyzeHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { symbol, capital, riskPercent, interval, marketType } = res.locals
    .body as Required<AnalyzeRequestBody>;

  const analysis = await buildTechnicalAnalysis(
    symbol,
    interval,
    capital,
    riskPercent,
    marketType,
  );

  res.json(analysis);
}

/**
 * Streams the AI narrative as Server-Sent Events so the technical signal can
 * render immediately while the (slower) LLM summary types in on the client.
 * Errors are surfaced in the stream because headers flush before generation.
 */
export async function analyzeSummaryHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const { symbol, capital, riskPercent, interval, marketType } = res.locals
    .body as Required<AnalyzeRequestBody>;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (!isOpenAiConfigured()) {
    res.write(`data: ${JSON.stringify({ token: AI_UNAVAILABLE_MESSAGE })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  try {
    const analysis = await buildTechnicalAnalysis(
      symbol,
      interval,
      capital,
      riskPercent,
      marketType,
    );

    for await (const token of streamAnalysis(toAnalysisInput(analysis))) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  } catch (error) {
    console.error("AI izoh oqim xatosi:", error);
    res.write(`data: ${JSON.stringify({ error: "AI izohda xato" })}\n\n`);
  } finally {
    res.end();
  }
}
