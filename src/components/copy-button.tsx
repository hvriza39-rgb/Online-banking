"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string | null | undefined }) {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-6 h-6 rounded-md bg-[#e4f2ec] hover:bg-[#d8ede6] flex items-center justify-center transition-colors"
      aria-label="Copy account number"
    >
      {copied ? (
        <Check className="w-3 h-3 text-[#0f7a6e]" />
      ) : (
        <Copy className="w-3 h-3 text-[#6a8c7a]" />
      )}
    </button>
  );
}
