import Anthropic from "@anthropic-ai/sdk";
import { checkLimits } from "@/lib/ratelimit";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { identity } from "@/lib/content";

export const runtime = "nodejs";

const MODEL = "claude-haiku-5-5";
const MAX_TURNS = 12;
const MAX_CHARS = 1000; // visitor messages
// Earlier assistant replies come back from the client too; allow a full
// max_tokens-length reply so follow-ups don't see their own answer truncated.
const MAX_ASSISTANT_CHARS = 3000;

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
    const { role } = m as IncomingMsg;
    const content = (m as IncomingMsg).content
      .slice(0, role === "user" ? MAX_CHARS : MAX_ASSISTANT_CHARS)
      .trim();
    if (content) clean.push({ role, content });
  }
  // Claude requires the conversation to open with a user turn; the MAX_TURNS
  // window can start on an assistant reply.
  while (clean.length > 0 && clean[0].role === "assistant") clean.shift();
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
    // Rate-limit store down: fail open (the Anthropic spend limit is still the backstop)
    console.error("[chat] rate limit check failed", err);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
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

  const client = new Anthropic();

  try {
    // Awaiting create() (rather than messages.stream()) surfaces auth, rate
    // limit, and overload errors here, before any bytes are sent, so they
    // still get the 502 fallback below.
    const stream = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      // Haiku 5.5 rejects non-default temperature/top_p/top_k. Thinking is on
      // by default and its tokens count toward max_tokens; a short persona
      // chat doesn't need it, and turning it off keeps first-token latency low.
      thinking: { type: "disabled" },
      // The knowledge file makes the system prompt the bulk of every request;
      // caching it makes repeat input ~10x cheaper.
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            } else if (event.type === "message_delta" && event.delta.stop_reason === "refusal") {
              // Safety classifiers can stop a reply mid-stream
              controller.enqueue(
                encoder.encode(`\n\nThat's not something I can help with. Ask me about Asad's work, or ${EMAIL_LINK} directly.`),
              );
            }
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
