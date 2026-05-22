"use client";

import { useState } from "react";
import { Eye, EyeOff, Wifi, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  card: {
    type:        "DEBIT" | "CREDIT";
    last4:       string;
    cardNumber:  string;
    expiryMonth: number;
    expiryYear:  number;
    cvv:         string;
    status:      "PENDING" | "ACTIVE" | "FROZEN" | "CANCELLED";
  };
  holderName:       string;
  hasCompletedDebit: boolean;
}

export function CardDisplay({ card, holderName, hasCompletedDebit }: Props) {
  const [revealed, setRevealed] = useState(false);

  const expiry = `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`;
  const displayNumber = revealed
    ? card.cardNumber.replace(/(.{4})/g, "$1 ").trim()
    : `•••• •••• •••• ${card.last4}`;

  const isActive = card.status === "ACTIVE";

  return (
    <div className="flex flex-col gap-5">

      {/* Card visual */}
      <div className="relative w-full rounded-[20px] overflow-hidden select-none"
           style={{
             aspectRatio: "1.586",
             background: card.type === "DEBIT"
               ? "linear-gradient(135deg, #0f2419 0%, #1a6648 50%, #2a9060 100%)"
               : "linear-gradient(135deg, #0f1e35 0%, #1a3a6b 50%, #2a5aaa 100%)",
           }}>

        {/* Shine overlay */}
        <div className="absolute inset-0 opacity-20"
             style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)" }} />

        {/* Top row */}
        <div className="absolute top-5 left-6 right-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/50">NexaBank</p>
            <p className="text-[11px] font-semibold text-white/80 mt-0.5">
              {card.type === "DEBIT" ? "Debit Card" : "Credit Card"}
            </p>
          </div>
          <Wifi className="w-5 h-5 text-white/60 rotate-90" strokeWidth={1.5} />
        </div>

        {/* Chip */}
        <div className="absolute top-[38%] left-6 w-9 h-7 rounded-[5px] border border-white/20"
             style={{ background: "linear-gradient(135deg, #d4a843, #f0c860)" }} />

        {/* Card number */}
        <div className="absolute bottom-[38%] left-6 right-6">
          <p className="font-mono text-[15px] font-semibold text-white tracking-[0.18em]">
            {displayNumber}
          </p>
        </div>

        {/* Bottom row */}
        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
          <div>
            <p className="text-[8px] text-white/40 uppercase tracking-widest mb-0.5">Card Holder</p>
            <p className="text-[12px] font-semibold text-white tracking-wide uppercase">
              {holderName.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-white/40 uppercase tracking-widest mb-0.5">Expires</p>
            <p className="font-mono text-[12px] font-semibold text-white">{expiry}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={cn(
          "absolute top-5 right-16 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
          isActive
            ? "bg-[#0f7a6e]/30 text-[#4dca8a] border border-[#4dca8a]/30"
            : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
        )}>
          {card.status}
        </div>
      </div>

      {/* Reveal toggle + CVV */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setRevealed((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e4f2ec] border border-[#c8dfd5] text-[12px] font-semibold text-[#1e7a52] hover:bg-[#d8ede6] transition-colors"
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {revealed ? "Hide details" : "Reveal details"}
        </button>

        {revealed && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e4f2ec] border border-[#c8dfd5]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6a8c7a]">CVV</p>
            <p className="font-mono text-[13px] font-bold text-[#0f2419]">{card.cvv}</p>
          </div>
        )}
      </div>

      {/* Activation notice or active status */}
      {!hasCompletedDebit ? (
        <div className="flex items-start gap-3 bg-[#fff8ec] border border-[#f0d9a0] rounded-2xl p-4">
          <AlertCircle className="w-4 h-4 text-[#c47a00] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[12px] font-bold text-[#7a5c00]">Card not yet active</p>
            <p className="text-[12px] text-[#7a5c00] mt-0.5 leading-relaxed">
              For security purposes, your card cannot be used until you have completed a debit transfer from your account. Once verified, your card will be activated automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-[#edf7f5] border border-[#a8dbd4] rounded-2xl p-4">
          <CheckCircle2 className="w-4 h-4 text-[#0f7a6e] flex-shrink-0" />
          <p className="text-[12px] font-semibold text-[#0f7a6e]">
            Your card is active and ready to use.
          </p>
        </div>
      )}

    </div>
  );
}
