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

export interface SupportResistance {
  support: number;
  resistance: number;
}

export interface RiskLevelsParams {
  currentPrice: number;
  atr: number;
  trend: Trend;
  capital: number;
  riskPercent: number;
}

export interface RiskLevelsResult {
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskRewardRatio: number;
  warning?: string;
}

export interface AnalysisIndicators {
  ema50: number;
  ema200: number;
  rsi: number;
  atr: number;
  support: number;
  resistance: number;
  volumeStatus: string;
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
  indicators: AnalysisIndicators;
  risk: AnalysisRisk;
}

export interface AnalyzeRequestBody {
  symbol: string;
  capital?: number;
  riskPercent?: number;
  interval?: string;
}
