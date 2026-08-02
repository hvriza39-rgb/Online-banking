"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { Currency } from "@prisma/client";

export function BalanceCard({
  balance,
  currency,
}: {
  balance: number;
  currency: Currency;
}) {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="relative rounded-[20px] p-6 overflow-hidden border border-[#1a6648]/30 shadow-lg bg-gradient-to-br from-[#1a6648] to-[#0f3d28]">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/60">
            Main Balance
          </p>
          <button
            onClick={() => setHidden((v) => !v)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label={hidden ? "Show balance" : "Hide balance"}
          >
            {hidden ? (
              <Eye className="w-3.5 h-3.5 text-white/80" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-white/80" />
            )}
          </button>
        </div>

        <p className="font-mono text-[40px] font-bold text-white leading-none tracking-tight tabular-nums">
          {hidden ? "••••••" : formatMoney(balance, currency)}
        </p>

        <div className="mt-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-white/80">
              Active
            </span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">{currency}</span>
        </div>
      </div>
    </div>
  );
}
