"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  balance: number;
  currency: string;
  minBalance: number;
}

export function CardApplyForm({ balance, currency, minBalance }: Props) {
  const [type, setType]       = useState<"DEBIT" | "CREDIT">("DEBIT");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const router                = useRouter();

  const insufficient = balance < minBalance;

  const handleSubmit = async () => {
    if (insufficient || loading) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/card/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Failed to create card."); return; }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {insufficient && (
        <div className="flex items-start gap-3 bg-[#fff8ec] border border-[#f0d9a0] rounded-2xl p-4">
          <ShieldAlert className="w-4 h-4 text-[#c47a00] mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-[#7a5c00] leading-relaxed">
            You need a minimum balance of {minBalance / 100} {currency} to apply for a card.
          </p>
        </div>
      )}

      {/* Card type selector */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#6a8c7a] mb-3">
          Choose card type
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["DEBIT", "CREDIT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "flex flex-col items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                type === t
                  ? "border-[#1e7a52] bg-[#edf7f5]"
                  : "border-[#c8dfd5] bg-[#f2f9f6] hover:border-[#4daa80]"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-[13px] flex items-center justify-center",
                type === t ? "bg-[#1e7a52]" : "bg-[#e4f2ec] border border-[#c8dfd5]"
              )}>
                <CreditCard className={cn("w-5 h-5", type === t ? "text-white" : "text-[#1e7a52]")} strokeWidth={1.8} />
              </div>
              <div>
                <p className={cn("text-[13px] font-bold", type === t ? "text-[#0f2419]" : "text-[#2d5042]")}>
                  {t === "DEBIT" ? "Debit Card" : "Credit Card"}
                </p>
                <p className="text-[11px] text-[#6a8c7a] mt-0.5">
                  {t === "DEBIT" ? "Spend what you have" : "Flexible spending limit"}
                </p>
              </div>
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center self-end ml-auto",
                type === t ? "border-[#1e7a52]" : "border-[#c8dfd5]"
              )}>
                {type === t && <div className="w-2 h-2 rounded-full bg-[#1e7a52]" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-[#b52b3a] text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={insufficient || loading}
        className="w-full py-3.5 rounded-2xl text-[13px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #1a6648, #3daa7a)" }}
      >
        {loading
          ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating card…</span>
          : `Apply for ${type === "DEBIT" ? "Debit" : "Credit"} Card`
        }
      </button>
    </div>
  );
}
