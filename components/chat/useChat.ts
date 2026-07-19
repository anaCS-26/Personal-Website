"use client";

import { useCallback, useRef, useState } from "react";
import { identity } from "@/lib/content";

export type Msg = { role: "user" | "assistant"; content: string };

export const SUGGESTIONS = [
  "Who is Asad?",
  "What has he built with AI?",
  "Tell me about PulmoLens",
  "What does he do for fun?",
];

export const FALLBACK =
  `Hmm, I can't reach my brain right now. You can [email Asad](mailto:${identity.email}) directly, or browse [his projects](/projects) while I recover.`;

export function useChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /** Abort any in-flight response and clear the conversation. */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setBusy(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setBusy(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      // Every state write is gated on the controller so a reset() mid-stream
      // can't resurrect a cleared conversation from a pending closure.
      const safeSet = (msgs: Msg[]) => {
        if (!ctrl.signal.aborted) setMessages(msgs);
      };

      const history: Msg[] = [...messages, { role: "user", content: trimmed }];
      safeSet(history);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-12) }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          let msg = FALLBACK;
          try {
            const data = (await res.json()) as { message?: string };
            if (data.message) msg = data.message;
          } catch {
            // non-JSON error body — keep generic fallback
          }
          safeSet([...history, { role: "assistant", content: msg }]);
          return;
        }

        safeSet([...history, { role: "assistant", content: "" }]);

        // Typewriter reveal: network chunks land in `target`; a rAF loop reveals
        // it a few characters per frame (faster when the backlog grows) so the
        // reply reads fluidly instead of appearing in large blocks.
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let target = "";
        let shown = 0;
        let doneReading = false;

        const animation = reduced
          ? null
          : new Promise<void>((resolve) => {
              let raf = 0;
              const tick = () => {
                if (ctrl.signal.aborted) {
                  cancelAnimationFrame(raf);
                  resolve();
                  return;
                }
                if (shown < target.length) {
                  const backlog = target.length - shown;
                  const step = Math.max(2, Math.ceil(backlog / 30));
                  shown = Math.min(target.length, shown + step);
                  safeSet([
                    ...history,
                    { role: "assistant", content: target.slice(0, shown) },
                  ]);
                }
                if (doneReading && shown >= target.length) {
                  resolve();
                  return;
                }
                raf = requestAnimationFrame(tick);
              };
              raf = requestAnimationFrame(tick);
            });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          target += decoder.decode(value, { stream: true });
          if (reduced) {
            safeSet([...history, { role: "assistant", content: target }]);
          }
        }
        doneReading = true;
        if (animation) await animation;

        if (!target.trim()) {
          safeSet([...history, { role: "assistant", content: FALLBACK }]);
        }
      } catch {
        if (!ctrl.signal.aborted) {
          safeSet([...history, { role: "assistant", content: FALLBACK }]);
        }
      } finally {
        if (!ctrl.signal.aborted) setBusy(false);
      }
    },
    [busy, messages],
  );

  return { messages, busy, send, reset };
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export type { SpeechRecognitionLike };
