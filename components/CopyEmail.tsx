"use client";

import { useState } from "react";
import { identity } from "@/lib/content";

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: fall back to opening the mail client
      window.location.href = `mailto:${identity.email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="rounded-md border border-line px-2.5 py-1 text-[13px] text-fg-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
