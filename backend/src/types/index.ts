export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export interface Ticker24hr {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
}

/** Binance /api/v3/klines raw response item */
export type BinanceKlineRaw = [
  number, // openTime
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // closeTime
  ...unknown[],
];

export interface BinanceTicker24hrRaw {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
}

export type Trend = "bullish" | "bearish" | "neutral";
export type VolumeStatus = "high" | "normal" | "low";
export type MarketType = "spot" | "futures";
export type TradeSide = "long" | "short" | null;

export interface SupportResistance {
  support: number;
  resistance: number;
}

export interface PositionSizingParams {
  currentPrice: number;
  stopLoss: number;
  capital: number;
  riskPercent: number;
}

export interface PositionSizingResult {
  positionSize: number;
  warning?: string;
}

export interface AnalysisIndicators {
  ema50: number;
  ema200: number;
  rsi: number;
  atr: number;
  support: number;
  resistance: number;
  volumeStatus: VolumeStatus;
}

export interface AnalysisRisk {
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskRewardRatio: number;
}

export interface AnalysisInput {
  symbol: string;
  currentPrice: number;
  trend: string;
  marketType: string;
  indicators: AnalysisIndicators;
  risk: AnalysisRisk;
  strategy: StrategyInfo;
  verdict: VerdictInfo;
}

export interface AnalyzeRequestBody {
  symbol: string;
  capital?: number;
  riskPercent?: number;
  interval?: string;
  marketType?: MarketType;
}

export type StrategyType =
  | "trend_pullback"
  | "breakout_retest"
  | "ema_crossover"
  | "rsi_divergence";

export interface StrategyChecklistItem {
  label: string;
  passed: boolean;
  detail: string;
}

export interface StrategyInfo {
  type: StrategyType;
  label: string;
  description: string;
  confidence: number;
  checklist: StrategyChecklistItem[];
}

export interface VerdictInfo {
  verdict: "enter" | "wait" | "avoid";
  verdictLabel: string;
  side: TradeSide;
  headline: string;
  reason: string;
  rrNow: number;
  rrIdeal: number;
  entryZone: [number, number];
  invalidation: number;
  stopLoss: number;
  takeProfit: number;
}

export interface ScreenerCoinResult {
  symbol: string;
  currentPrice: number;
  priceChangePercent: number;
  trend: Trend;
  verdict: "enter" | "wait" | "avoid";
  verdictLabel: string;
  side: TradeSide;
  reason: string;
  rrIdeal: number;
  rsi: number;
  strategy: StrategyInfo;
}

export interface ScreenerResponse {
  scanned: number;
  interval: string;
  marketType: MarketType;
  updatedAt: string;
  coins: ScreenerCoinResult[];
}
