import type { Request, Response } from "express";
import { isOpenAiConfigured, streamChat } from "../services/openai.service.js";
import type { ChatBody } from "../validators/chat.validator.js";

/**
 * Streams an AI chat response as Server-Sent Events. Errors are surfaced in the
 * stream (never thrown) because headers are flushed before generation starts.
 */
export async function chatHandler(_req: Request, res: Response): Promise<void> {
  const { messages, context } = res.locals.body as ChatBody;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (!isOpenAiConfigured()) {
    res.write(
      `data: ${JSON.stringify({
        token: "AI yordamchi hozircha mavjud emas (API kaliti sozlanmagan).",
      })}\n\n`,
    );
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  try {
    for await (const token of streamChat(messages, context)) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
  } catch (error) {
    console.error("Chat oqim xatosi:", error);
    res.write(`data: ${JSON.stringify({ error: "AI javobida xato" })}\n\n`);
  } finally {
    res.end();
  }
}
