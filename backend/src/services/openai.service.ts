import OpenAI from "openai";
import type { AnalysisInput } from "../types/index.js";

const SYSTEM_MESSAGE = `Sen professional kripto trading tahlilchisan. Foydalanuvchiga moliyaviy maslahat emas.

Qoidalar:
- O'zbek tilida, maksimum 150 so'z
- 3 qisqa paragraph: tanlangan strategiya bo'yicha holat, kirish/kutish sababi, risk nuqtasi
- Faqat berilgan strategiyani tushuntir — boshqa strategiya taklif qilma
- Aniq buy/sell buyrug'i bermagin
- Oxirida "Bu moliyaviy maslahat emas" deb yoz`;

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
  const checklistText = data.strategy.checklist
    .map(
      (item) => `- ${item.label}: ${item.passed ? "✓" : "✗"} (${item.detail})`,
    )
    .join("\n");

  return `Quyidagi ${data.symbol} ${data.marketType.toUpperCase()} ma'lumotlarini tahlil qil:

Bozor turi: ${data.marketType === "futures" ? "Futures (long/short)" : "Spot (faqat long)"}
Joriy narx: ${data.currentPrice}
Trend: ${data.trend}

Tanlangan strategiya: ${data.strategy.label} (${data.strategy.confidence}% ishonch)
Tavsif: ${data.strategy.description}

Strategiya checklist:
${checklistText}

Verdikt: ${data.verdict.verdictLabel} — ${data.verdict.headline}
Sababi: ${data.verdict.reason}
Kirish zonasi: ${data.verdict.entryZone[0]} – ${data.verdict.entryZone[1]}
Invalidation: ${data.verdict.invalidation}

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

${data.strategy.label} strategiyasi bo'yicha qisqa tahlil yoz.`;
}

export async function generateAnalysis(data: AnalysisInput): Promise<string> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model,
    max_tokens: 400,
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
