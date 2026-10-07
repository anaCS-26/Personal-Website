"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarMark } from "@/components/AvatarMark";
import { LossLandscape } from "@/components/LossLandscape";
import { NavCards } from "@/components/NavCards";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProjectCard } from "@/components/chat/ProjectCard";
import { linkedProjectSlugs, renderRich } from "@/components/chat/rich";
import {
  SUGGESTIONS,
  getSpeechRecognition,
  useChat,
  type Msg,
  type SpeechRecognitionLike,
} from "@/components/chat/useChat";
import { identity, projects, type Project } from "@/lib/content";

const MAX_CARDS = 2;

/**
 * Project cards to show under each assistant reply: the projects it links,
 * once the reply has finished streaming. Replies linking more than MAX_CARDS
 * projects are overviews and get none, and a project is carded at most once
 * per conversation.
 */
function projectCards(messages: Msg[], streamingIndex: number): Project[][] {
  const carded = new Set<string>();
  return messages.map((m, i) => {
    if (m.role !== "assistant" || i === streamingIndex) return [];
    const linked = linkedProjectSlugs(m.content)
      .map((slug) => projects.find((p) => p.slug === slug))
      .filter((p): p is Project => p !== undefined);
    if (linked.length > MAX_CARDS) return [];
    const fresh = linked.filter((p) => !carded.has(p.slug));
    fresh.forEach((p) => carded.add(p.slug));
    return fresh;
  });
}

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

  const cards = projectCards(messages, busy ? messages.length - 1 : -1);

  return (
    // Chat mode pins the layout to the viewport so the conversation scrolls
    // inside its own pane and the chat bar stays docked
    <div className={`relative isolate flex flex-col ${open ? "h-dvh" : "min-h-dvh"}`}>
      <LossLandscape
        dimmed={open}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(0,0,0,0.45),#000_85%)]"
      />

      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* name */}
      <header className="animate-enter px-5 pt-16 text-center sm:pt-20">
        <h1
          className={`font-display leading-none tracking-tight transition-[font-size] duration-300 ${
            open ? "text-4xl sm:text-5xl" : "text-6xl sm:text-7xl"
          }`}
        >
          Asad Ansari
        </h1>
        <p className="mt-4 text-fg-muted">
          {identity.role} · {identity.location}
        </p>
        {!open && (
          <p className="mx-auto mt-2 max-w-md text-fg-muted">
            I build computer vision and LLM systems and ship them to production.
          </p>
        )}
      </header>

      {/* middle: nav cards OR conversation */}
      <main className="flex min-h-0 flex-1 flex-col justify-center py-10">
        {open ? (
          <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <button
                type="button"
                onClick={closeChat}
                className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M19 12H5m6-6-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>
              <p className="flex items-center gap-2 text-sm font-medium">
                <AvatarMark size={20} thinking={busy} />
                AsadGPT
              </p>
            </div>
            <div
              ref={scrollRef}
              aria-live="polite"
              className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-2 text-[15px] leading-relaxed"
            >
              {messages.length === 0 && (
                <p className="pt-10 text-center text-sm text-fg-faint">
                  Ask about Asad&apos;s work, projects, or life outside of it.
                </p>
              )}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="ml-auto w-fit max-w-[85%] rounded-2xl bg-surface px-4 py-2.5"
                  >
                    {m.content}
                  </div>
                ) : (
                  <div key={i} className="flex max-w-[92%] gap-3">
                    <AvatarMark
                      size={24}
                      thinking={busy && i === messages.length - 1 && m.content === ""}
                    />
                    <div className="min-w-0 space-y-3 pt-0.5">
                      {m.content === "" ? (
                        <span className="text-fg-faint">Thinking…</span>
                      ) : (
                        renderRich(m.content)
                      )}
                      {cards[i].length > 0 && (
                        <div className="grid max-w-md gap-2 pt-1">
                          {cards[i].map((p) => (
                            <ProjectCard key={p.slug} p={p} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="animate-enter" style={{ animationDelay: "80ms" }}>
            <NavCards />
          </div>
        )}
      </main>

      {/* docked chat bar */}
      <div className="mx-auto w-full max-w-2xl px-5 pb-6">
        {(!open || messages.length === 0) && (
          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border border-line bg-bg-elevated px-3.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          className="flex items-center gap-1.5 rounded-xl border border-line-strong bg-bg-elevated p-1.5 shadow-[0_2px_10px_var(--shadow)] transition-colors focus-within:border-fg-faint"
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
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                listening
                  ? "bg-accent-soft text-accent"
                  : "text-fg-faint hover:bg-surface hover:text-fg"
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
            placeholder={listening ? "Listening…" : "Ask AsadGPT about Asad"}
            aria-label="Ask the assistant about Asad"
            maxLength={1000}
            className="h-9 min-w-0 flex-1 bg-transparent px-2 text-[15px] placeholder:text-fg-faint focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fg text-bg transition-opacity disabled:opacity-25"
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
        <p className="mt-2.5 text-center text-xs text-fg-faint">
          AsadGPT answers from notes Asad wrote about himself. It can make mistakes.
        </p>
      </div>

      {!open && (
        <p className="pointer-events-none absolute bottom-5 right-5 hidden max-w-[15rem] text-right text-[11px] leading-snug text-fg-faint xl:block">
          Background: contours of a loss surface, with optimizers running
          gradient descent. Move your cursor to reshape it.
        </p>
      )}
    </div>
  );
}
