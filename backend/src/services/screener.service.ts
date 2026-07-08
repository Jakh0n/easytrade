import { buildTechnicalAnalysis } from "./analysis.service.js";
import { getAll24hrTickers } from "./binance.service.js";
import type {
  MarketType,
  ScreenerCoinResult,
  ScreenerResponse,
} from "../types/index.js";

const EXCLUDED_SYMBOLS = new Set([
  "USDCUSDT",
  "BUSDUSDT",
  "TUSDUSDT",
  "FDUSDUSDT",
  "DAIUSDT",
  "EURUSDT",
  "USDPUSDT",
]);

const DEFAULT_INTERVAL = "4h";
const RESULT_LIMIT = 20;
const MIN_QUOTE_VOLUME = 50_000;
const CONCURRENCY = 6;
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_DELAY_MS = 80;

let cache: { key: string; data: ScreenerResponse; expiresAt: number } | null =
  null;

function isScannableSymbol(symbol: string): boolean {
  if (!symbol.endsWith("USDT")) {
    return false;
  }

  if (EXCLUDED_SYMBOLS.has(symbol)) {
    return false;
  }

  if (
    symbol.includes("UP") ||
    symbol.includes("DOWN") ||
    symbol.includes("BEAR") ||
    symbol.includes("BULL")
  ) {
    return false;
  }

  return true;
}

async function runPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R | null>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function runWorker(): Promise<void> {
    while (index < items.length) {
      const current = items[index]!;
      index += 1;
      const result = await worker(current);
      if (result) {
        results.push(result);
      }
      if (REQUEST_DELAY_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, runWorker),
  );

  return results;
}

async function scanSymbol(
  symbol: string,
  priceChangePercent: number,
  interval: string,
  marketType: MarketType,
): Promise<ScreenerCoinResult | null> {
  try {
    const analysis = await buildTechnicalAnalysis(
      symbol,
      interval,
      10_000,
      2,
      marketType,
    );

    if (analysis.verdict.verdict !== "enter") {
      return null;
    }

    return {
      symbol: analysis.symbol,
      currentPrice: analysis.currentPrice,
      priceChangePercent,
      trend: analysis.trend,
      verdict: analysis.verdict.verdict,
      verdictLabel: analysis.verdict.verdictLabel,
      side: analysis.verdict.side,
      reason: analysis.verdict.reason,
      rrIdeal: analysis.verdict.rrIdeal,
      rsi: analysis.indicators.rsi,
      strategy: analysis.strategy,
    };
  } catch {
    return null;
  }
}

export async function runMarketScreener(
  interval: string = DEFAULT_INTERVAL,
  limit: number = RESULT_LIMIT,
  marketType: MarketType = "spot",
): Promise<ScreenerResponse> {
  const cacheKey = `full:${marketType}:${interval}:${limit}`;

  if (cache && cache.key === cacheKey && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  const tickers = await getAll24hrTickers(marketType);

  const candidates = tickers
    .filter(
      (ticker) =>
        isScannableSymbol(ticker.symbol) &&
        ticker.quoteVolume >= MIN_QUOTE_VOLUME,
    )
    .sort((a, b) => b.quoteVolume - a.quoteVolume);

  const scanned = await runPool(candidates, CONCURRENCY, (ticker) =>
    scanSymbol(ticker.symbol, ticker.priceChangePercent, interval, marketType),
  );

  const coins = scanned.sort((a, b) => b.rrIdeal - a.rrIdeal).slice(0, limit);

  const response: ScreenerResponse = {
    scanned: candidates.length,
    interval,
    marketType,
    updatedAt: new Date().toISOString(),
    coins,
  };

  cache = {
    key: cacheKey,
    data: response,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return response;
}
