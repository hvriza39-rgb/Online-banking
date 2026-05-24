"use client";

import { useState } from "react";
import { X, Landmark, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Currency } from "@prisma/client";

const PURPOSES = [
  "Personal",
  "Business",
  "Education",
  "Medical",
  "Home Improvement",
  "Other",
];

const TERMS = [3, 6, 12, 24, 36];

type Step = "form" | "review" | "success";

interface LoanSheetProps {
  currency: Currency;
}

export default function LoanSheet({ currency }: LoanSheetProps) {
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState<Step>("form");
  const [amount, setAmount]   = useState("");
  const [purpose, setPurpose] = useState("");
  const [term, setTerm]       = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const sym = currency === "EUR" ? "€" : "$";
  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const valid = amountCents >= 10000 && purpose && term; // min 100

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/loans/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountCents, purpose, termMonths: term, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply");
      setStep("success");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("form");
    setAmount("");
    setPurpose("");
    setTerm(null);
    setError("");
    setOpen(false);
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-[#e4f2ec] border border-[#c8dfd5] shadow-sm hover:border-[#4daa80] transition-all active:scale-[0.97]"
      >
        <div className="w-9 h-9 rounded-full bg-[#d8ede6] flex items-center justify-center">
          <Landmark className="w-4 h-4 text-[#1e7a52]" strokeWidth={1.8} />
        </div>
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#2d5042]">Loan</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0f2419]/25 backdrop-blur-sm"
          onClick={reset}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-[#f2f9f6] rounded-t-[24px] shadow-2xl max-w-lg mx-auto overflow-hidden">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#c8dfd5]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ede6]">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#1e7a52]"
                 style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                NexaBank
              </p>
              <p className="text-[15px] font-semibold text-[#0f2419] mt-0.5"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                {step === "success" ? "Application Submitted" : "Loan Application"}
              </p>
            </div>
            <button
              onClick={reset}
              className="w-8 h-8 rounded-full bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center hover:bg-[#d8ede6] transition-colors"
            >
              <X className="w-4 h-4 text-[#2d5042]" />
            </button>
          </div>

          {/* ── STEP: form ── */}
          {step === "form" && (
            <div className="px-5 py-4 flex flex-col gap-4">

              {/* Amount */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#6a8c7a] mb-1.5 block">
                  Loan Amount ({currency})
                </label>
                <div className="flex items-center gap-2 bg-[#e4f2ec] border border-[#c8dfd5] rounded-[12px] px-4 py-3 focus-within:border-[#1e7a52] transition-colors">
                  <span className="font-mono text-[15px] font-semibold text-[#6a8c7a]">{sym}</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent font-mono text-[16px] font-semibold text-[#0f2419] placeholder-[#a8c4b8] outline-none"
                  />
                </div>
                {amountCents > 0 && amountCents < 10000 && (
                  <p className="text-[10px] text-rose-500 mt-1">Minimum loan amount is {sym}100.00</p>
                )}
              </div>

              {/* Purpose */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#6a8c7a] mb-1.5 block">
                  Purpose
                </label>
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map(p => (
                    <button
                      key={p}
                      onClick={() => setPurpose(p)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        purpose === p
                          ? "bg-[#1e7a52] border-[#1e7a52] text-white"
                          : "bg-[#e4f2ec] border-[#c8dfd5] text-[#2d5042] hover:border-[#4daa80]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Term */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#6a8c7a] mb-1.5 block">
                  Repayment Term
                </label>
                <div className="flex gap-2">
                  {TERMS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`flex-1 py-2.5 rounded-[10px] border text-[11px] font-bold transition-all ${
                        term === t
                          ? "bg-[#1e7a52] border-[#1e7a52] text-white"
                          : "bg-[#e4f2ec] border-[#c8dfd5] text-[#2d5042] hover:border-[#4daa80]"
                      }`}
                    >
                      {t}mo
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-[10px] px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <p className="text-[11px] text-rose-600">{error}</p>
                </div>
              )}

              <button
                disabled={!valid}
                onClick={() => setStep("review")}
                className="w-full py-3.5 rounded-[12px] bg-[#1e7a52] text-white text-[13px] font-bold tracking-[0.04em] transition-all hover:bg-[#155c3a] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Review Application
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP: review ── */}
          {step === "review" && (
            <div className="px-5 py-4 flex flex-col gap-3">
              <p className="text-[11px] text-[#6a8c7a] leading-relaxed">
                Please review your loan details before submitting.
              </p>

              <div className="bg-[#e4f2ec] rounded-[14px] border border-[#c8dfd5] divide-y divide-[#d8ede6] overflow-hidden">
                {[
                  { label: "Amount",   value: `${sym}${(amountCents / 100).toFixed(2)} ${currency}` },
                  { label: "Purpose",  value: purpose },
                  { label: "Term",     value: `${term} months` },
                  { label: "Status",   value: "Pending Review" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6a8c7a]">{label}</span>
                    <span className="font-mono text-[12px] font-bold text-[#0f2419]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 bg-[#fff8ec] border border-[#f0d9a0] rounded-[10px] px-3 py-2.5">
                <Clock className="w-3.5 h-3.5 text-[#c47a00] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-[#7a5c00] leading-relaxed">
                  Loans are reviewed by our team. Approved funds are credited directly to your account.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-[10px] px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <p className="text-[11px] text-rose-600">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-[12px] bg-[#e4f2ec] border border-[#c8dfd5] text-[12px] font-semibold text-[#2d5042] hover:bg-[#d8ede6] transition-colors"
                >
                  Edit
                </button>
                <button
                  disabled={loading}
                  onClick={submit}
                  className="flex-2 flex-[2] py-3 rounded-[12px] bg-[#1e7a52] text-white text-[13px] font-bold tracking-[0.04em] hover:bg-[#155c3a] active:scale-[0.98] disabled:opacity-60 transition-all"
                >
                  {loading ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: success ── */}
          {step === "success" && (
            <div className="px-5 py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#edf7f5] border border-[#a8dbd4] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#0f7a6e]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-[#0f2419]"
                   style={{ fontFamily: "'Playfair Display', serif" }}>
                  Application Received
                </p>
                <p className="text-[12px] text-[#6a8c7a] mt-1.5 leading-relaxed max-w-[240px]">
                  Your loan application is under review. You'll be notified once a decision is made.
                </p>
              </div>
              <button
                onClick={reset}
                className="mt-2 px-8 py-3 rounded-[12px] bg-[#1e7a52] text-white text-[13px] font-bold hover:bg-[#155c3a] transition-colors"
              >
                Done
              </button>
            </div>
          )}

          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
