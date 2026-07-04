import OpenAI from "openai";
import type { AnalysisInput } from "../types/index.js";

const SYSTEM_MESSAGE = `Sen professional kripto spot trading tahlilchisan. Foydalanuvchiga moliyaviy maslahat emas, balki texnik ma'lumotlarga asoslangan tahlil ber.

Qoidalar:
- O'zbek tilida, qisqa va tushunarli yoz
- Trend, indikatorlar va support/resistance darajalarini tahlil qil
- Risk darajalari (stop loss, take profit) ni texnik nuqtai nazardan izohla
- Har doim oxirida "Bu moliyaviy maslahat emas" deb ogohlantirish qo'sh
- Aniq buy/sell buyrug'i bermagin, faqat texnik kuzatuvlar va ehtimolliklarni yoz`;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY muhit o'zgaruvchisi sozlanmagan");
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

function buildUserPrompt(data: AnalysisInput): string {
  return `Quyidagi ${data.symbol} spot trading ma'lumotlarini tahlil qil:

Joriy narx: ${data.currentPrice}
Trend: ${data.trend}

Indikatorlar:
- EMA50: ${data.indicators.ema50}
- EMA200: ${data.indicators.ema200}
- RSI(14): ${data.indicators.rsi}
- ATR(14): ${data.indicators.atr}
- Support: ${data.indicators.support}
- Resistance: ${data.indicators.resistance}
- Volume holati: ${data.indicators.volumeStatus}

Risk darajalari:
- Stop Loss: ${data.risk.stopLoss}
- Take Profit: ${data.risk.takeProfit}
- Position Size: ${data.risk.positionSize}
- Risk/Reward: ${data.risk.riskRewardRatio}

Texnik tahlil, asosiy kuzatuvlar va ehtimoliy senariylarni yoz.`;
}

export async function generateAnalysis(data: AnalysisInput): Promise<string> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model,
    max_tokens: 1000,
    messages: [
      { role: "system", content: SYSTEM_MESSAGE },
      { role: "user", content: buildUserPrompt(data) },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenAI dan bo'sh javob qaytdi");
  }

  return content;
}
