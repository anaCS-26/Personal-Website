import { GoogleGenAI } from "@google/genai";
import { checkLimits } from "@/lib/ratelimit";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { identity } from "@/lib/content";

export const runtime = "nodejs";

const MODEL = "gemini-2.5-flash-lite";
const MAX_TURNS = 12;
const MAX_CHARS = 1000;

const EMAIL_LINK = `[email Asad](mailto:${identity.email})`;

function friendly(status: number, message: string) {
  return Response.json({ message }, { status });
}

type IncomingMsg = { role: "user" | "assistant"; content: string };

function parseBody(body: unknown): IncomingMsg[] | null {
  if (typeof body !== "object" || body === null) return null;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const clean: IncomingMsg[] = [];
  for (const m of messages.slice(-MAX_TURNS)) {
    if (
      typeof m !== "object" ||
      m === null ||
      ((m as IncomingMsg).role !== "user" && (m as IncomingMsg).role !== "assistant") ||
      typeof (m as IncomingMsg).content !== "string"
    ) {
      return null;
    }
    const content = (m as IncomingMsg).content.slice(0, MAX_CHARS).trim();
    if (content) clean.push({ role: (m as IncomingMsg).role, content });
  }
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") return null;
  return clean;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

  try {
    const verdict = await checkLimits(ip);
    if (!verdict.ok) {
      return friendly(
        verdict.reason === "ip" ? 429 : 503,
        verdict.reason === "ip"
          ? `Whoa, that's a lot of questions at once. Give me a minute to catch my breath, or ${EMAIL_LINK} directly.`
          : `I've hit my chat budget for today. Please ${EMAIL_LINK} instead, he answers fast.`,
      );
    }
  } catch (err) {
    // Rate-limit store down: fail open (the Gemini quota is still the backstop)
    console.error("[chat] rate limit check failed", err);
  }

  if (!process.env.GEMINI_API_KEY) {
    return friendly(
      503,
      `I'm not wired up yet in this environment. In the meantime, ${EMAIL_LINK} or browse [his projects](/#projects).`,
    );
  }

  let messages: IncomingMsg[] | null = null;
  try {
    messages = parseBody(await req.json());
  } catch {
    messages = null;
  }
  if (!messages) {
    return friendly(400, `That message didn't come through right. Try again?`);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 700,
        temperature: 0.6,
      },
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error("[chat] stream interrupted", err);
          controller.enqueue(
            encoder.encode(`\n\n…I lost my train of thought. Mind asking that again?`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[chat] generation failed", err);
    return friendly(
      502,
      `My brain is briefly offline. Please ${EMAIL_LINK}, or try again in a moment.`,
    );
  }
}
