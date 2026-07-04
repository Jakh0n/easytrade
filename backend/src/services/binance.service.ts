import axios, { isAxiosError } from "axios";
import type {
  BinanceKlineRaw,
  BinanceTicker24hrRaw,
  Candle,
  Ticker24hr,
} from "../types/index.js";

const BINANCE_BASE_URL = "https://api.binance.com";

function handleBinanceError(error: unknown): never {
  if (isAxiosError(error)) {
    if (error.response?.status === 400) {
      throw new Error("Symbol topilmadi yoki noto'g'ri");
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      throw new Error("Binance API ga ulanish vaqti tugadi");
    }

    if (!error.response) {
      throw new Error("Binance API ga ulanib bo'lmadi. Tarmoq xatosini tekshiring");
    }

    throw new Error(
      `Binance API xatosi: ${error.response.status} ${error.response.statusText}`,
    );
  }

  throw new Error("Kutilmagan xato yuz berdi");
}

function parseKline(raw: BinanceKlineRaw): Candle {
  return {
    openTime: raw[0],
    open: Number(raw[1]),
    high: Number(raw[2]),
    low: Number(raw[3]),
    close: Number(raw[4]),
    volume: Number(raw[5]),
    closeTime: raw[6],
  };
}

export async function getKlines(
  symbol: string,
  interval: string,
  limit: number = 300,
): Promise<Candle[]> {
  try {
    const { data } = await axios.get<BinanceKlineRaw[]>(
      `${BINANCE_BASE_URL}/api/v3/klines`,
      {
        params: { symbol: symbol.toUpperCase(), interval, limit },
        timeout: 10_000,
      },
    );

    return data.map(parseKline);
  } catch (error) {
    handleBinanceError(error);
  }
}

export async function get24hrTicker(symbol: string): Promise<Ticker24hr> {
  try {
    const { data } = await axios.get<BinanceTicker24hrRaw>(
      `${BINANCE_BASE_URL}/api/v3/ticker/24hr`,
      {
        params: { symbol: symbol.toUpperCase() },
        timeout: 10_000,
      },
    );

    return {
      symbol: data.symbol,
      lastPrice: Number(data.lastPrice),
      priceChangePercent: Number(data.priceChangePercent),
      volume: Number(data.volume),
      quoteVolume: Number(data.quoteVolume),
    };
  } catch (error) {
    handleBinanceError(error);
  }
}
