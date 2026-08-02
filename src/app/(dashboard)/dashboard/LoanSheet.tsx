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
      {/* Trigger — circular, matches new dashboard */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-2 group"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 group-hover:scale-105 transition-all shadow-sm">
          <Landmark className="w-5 h-5 text-amber-700" strokeWidth={2} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Loan
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm"
          onClick={reset}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-[24px] shadow-2xl max-w-lg mx-auto overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-700"
                 style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                NexaBank
              </p>
              <p className="text-[16px] font-bold text-slate-900 mt-0.5"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                {step === "success" ? "Application Submitted" : "Loan Application"}
              </p>
            </div>
            <button
              onClick={reset}
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* ── STEP: form ── */}
          {step === "form" && (
            <div className="px-5 py-5 flex flex-col gap-4">
              {/* Amount */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1.5 block">
                  Loan Amount ({currency})
                </label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <span className="font-mono text-[15px] font-semibold text-slate-400">{sym}</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent font-mono text-[16px] font-semibold text-slate-900 placeholder-slate-300 outline-none"
                  />
                </div>
                {amountCents > 0 && amountCents < 10000 && (
                  <p className="text-[10px] text-rose-500 mt-1">Minimum loan amount is {sym}100.00</p>
                )}
              </div>

              {/* Purpose */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1.5 block">
                  Purpose
                </label>
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map(p => (
                    <button
                      key={p}
                      onClick={() => setPurpose(p)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        purpose === p
                          ? "bg-emerald-700 border-emerald-700 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Term */}
              <div>
                <label className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1.5 block">
                  Repayment Term
                </label>
                <div className="flex gap-2">
                  {TERMS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`flex-1 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                        term === t
                          ? "bg-emerald-700 border-emerald-700 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-400"
                      }`}
                    >
                      {t}mo
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <p className="text-[11px] text-rose-600">{error}</p>
                </div>
              )}

              <button
                disabled={!valid}
                onClick={() => setStep("review")}
                className="w-full py-3.5 rounded-xl bg-emerald-700 text-white text-[13px] font-bold tracking-wide transition-all hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Review Application
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP: review ── */}
          {step === "review" && (
            <div className="px-5 py-5 flex flex-col gap-3">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Please review your loan details before submitting.
              </p>

              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {[
                  { label: "Amount",   value: `${sym}${(amountCents / 100).toFixed(2)} ${currency}` },
                  { label: "Purpose",  value: purpose },
                  { label: "Term",     value: `${term} months` },
                  { label: "Status",   value: "Pending Review" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
                    <span className="font-mono text-[12px] font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Loans are reviewed by our team. Approved funds are credited directly to your account.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <p className="text-[11px] text-rose-600">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  disabled={loading}
                  onClick={submit}
                  className="flex-[2] py-3 rounded-xl bg-emerald-700 text-white text-[13px] font-bold hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-60 transition-all"
                >
                  {loading ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: success ── */}
          {step === "success" && (
            <div className="px-5 py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[16px] font-bold text-slate-900"
                   style={{ fontFamily: "'Playfair Display', serif" }}>
                  Application Received
                </p>
                <p className="text-[12px] text-slate-400 mt-1.5 leading-relaxed max-w-[260px]">
                  Your loan application is under review. You&apos;ll be notified once a decision is made.
                </p>
              </div>
              <button
                onClick={reset}
                className="mt-2 px-8 py-3 rounded-xl bg-emerald-700 text-white text-[13px] font-bold hover:bg-emerald-800 transition-colors"
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
