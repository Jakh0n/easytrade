import { z } from "zod";

export const intervalSchema = z
  .enum(["15m", "1h", "4h", "1d", "1w"])
  .default("4h");

export const marketTypeSchema = z.enum(["spot", "futures"]).default("spot");

export const analyzeBodySchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "symbol majburiy")
    .transform((value) => value.toUpperCase()),
  capital: z.coerce.number().positive("capital musbat bo'lishi kerak").default(10_000),
  riskPercent: z.coerce
    .number()
    .positive("riskPercent musbat bo'lishi kerak")
    .max(100, "riskPercent 100 dan oshmasligi kerak")
    .default(2),
  interval: intervalSchema,
  marketType: marketTypeSchema,
});

export const screenerQuerySchema = z.object({
  interval: intervalSchema,
  marketType: marketTypeSchema,
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const backtestQuerySchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "symbol majburiy")
    .transform((value) => value.toUpperCase()),
  interval: intervalSchema,
  marketType: marketTypeSchema,
});

export type AnalyzeBody = z.infer<typeof analyzeBodySchema>;
export type ScreenerQuery = z.infer<typeof screenerQuerySchema>;
export type BacktestQuery = z.infer<typeof backtestQuerySchema>;
