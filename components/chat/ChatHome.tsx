"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarMark } from "@/components/AvatarMark";
import { NavCards } from "@/components/NavCards";
import { ThemeToggle } from "@/components/ThemeToggle";
import { renderRich } from "@/components/chat/rich";
import {
  SUGGESTIONS,
  getSpeechRecognition,
  useChat,
  type SpeechRecognitionLike,
} from "@/components/chat/useChat";
import { identity } from "@/lib/content";

export function ChatHome() {
  const { messages, busy, send, reset } = useChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSpeechAvailable(getSpeechRecognition() !== null);
    // Restore chat mode on deep link / reload with ?chat=true
    if (new URLSearchParams(window.location.search).get("chat") === "true") {
      setOpen(true);
    }
    const onPop = () => {
      const nowOpen =
        new URLSearchParams(window.location.search).get("chat") === "true";
      setOpen(nowOpen);
      if (!nowOpen) reset(); // leaving chat (browser back) starts fresh next time
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [reset]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const openChat = useCallback(() => {
    // History write stays OUTSIDE the setState updater: Next.js syncs its
    // Router on pushState, and updaters run during render (React error #185)
    if (new URLSearchParams(window.location.search).get("chat") !== "true") {
      window.history.pushState({ chat: true }, "", "?chat=true");
    }
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    // replaceState (not history.back) so closing works the same whether the
    // user arrived via the chip flow or a ?chat=true deep link
    window.history.replaceState(null, "", "/");
    setOpen(false);
    reset(); // exiting the chat ends the conversation — next open starts fresh
  }, [reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeChat]);

  const ask = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      openChat();
      setInput("");
      void send(text);
      inputRef.current?.focus();
    },
    [openChat, send],
  );

  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.onresult = (e) => {
      const transcript = Array.from(
        { length: e.results.length },
        (_, i) => e.results[i][0].transcript,
      ).join("");
      setInput(transcript);
    };
    rec.onend = () => {
      setListening(false);
      inputRef.current?.focus();
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }, [listening]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px 400px at 50% -10%, var(--glow), transparent 70%), radial-gradient(800px 500px at 50% 110%, var(--glow-cool), transparent 70%)",
        }}
      />

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* name */}
      <header className="px-5 pt-14 text-center sm:pt-16">
        <h1
          className={`animate-fade-up font-display leading-none transition-all duration-500 ${
            open ? "text-4xl sm:text-5xl" : "text-6xl sm:text-7xl"
          }`}
        >
          Asad Ansari
        </h1>
        <p
          className="animate-fade-up mt-3 font-mono text-sm text-fg-muted"
          style={{ animationDelay: "120ms" }}
        >
          {identity.role} · {identity.location}
        </p>
      </header>

      {/* middle: nav cards OR conversation */}
      <main className="flex min-h-0 flex-1 flex-col justify-center py-8">
        {open ? (
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-5">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={closeChat}
                className="link-sweep font-mono text-xs text-fg-muted hover:text-fg"
              >
                ← back to the site
              </button>
              <p className="flex items-center gap-2 font-display text-lg">
                <AvatarMark size={24} thinking={busy} />
                AsadGPT
              </p>
            </div>
            <div
              ref={scrollRef}
              aria-live="polite"
              className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-2 text-[15px] leading-relaxed"
            >
              {messages.length === 0 && (
                <p className="pt-10 text-center font-mono text-sm text-fg-faint">
                  ask AsadGPT anything, from his projects to what he cooks
                </p>
              )}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-accent-soft px-4 py-2.5"
                  >
                    {m.content}
                  </div>
                ) : (
                  <div key={i} className="flex max-w-[92%] gap-2.5">
                    <AvatarMark
                      size={26}
                      thinking={busy && i === messages.length - 1 && m.content === ""}
                    />
                    <div className="w-fit rounded-2xl rounded-bl-sm bg-surface px-4 py-2.5">
                      {renderRich(m.content)}
                      {busy && i === messages.length - 1 && (
                        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-blink-dot bg-accent" />
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-up" style={{ animationDelay: "220ms" }}>
            <NavCards />
          </div>
        )}
      </main>

      {/* docked chat bar */}
      <div
        className="animate-fade-up mx-auto w-full max-w-3xl px-5 pb-6"
        style={{ animationDelay: open ? "0ms" : "320ms" }}
      >
        {(!open || messages.length === 0) && (
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border border-line bg-bg-elevated/80 px-3.5 py-1.5 font-mono text-[11px] text-fg-muted backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          className="flex items-center gap-2 rounded-2xl border border-line bg-bg-elevated/90 p-2.5 shadow-[0_16px_50px_-20px_var(--shadow)] backdrop-blur-sm focus-within:border-line-strong"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          {speechAvailable && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                listening
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-transparent text-fg-faint hover:text-accent"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "listening…" : "What would you like to know about Asad?"}
            aria-label="Ask the assistant about Asad"
            maxLength={1000}
            className="h-10 min-w-0 flex-1 bg-transparent px-2 text-[15px] placeholder:text-fg-faint focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-contrast transition-opacity disabled:opacity-35"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 19V5m0 0l-6 6m6-6l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
        <p className="mt-2.5 text-center font-mono text-[10px] text-fg-faint">
          AsadGPT · a live LLM that answers from my real experience
        </p>
      </div>
    </div>
  );
}
