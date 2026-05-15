'use client' 

import { useState } from "react";

export default function BankLandingPage() {
  const [amount, setAmount] = useState("1000");

  const received = isNaN(Number(amount))
    ? "0.00"
    : (Number(amount) * 1.0842 - Number(amount) * 0.0015).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500/30 overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-1/5 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-base select-none">
              N
            </div>
            <span className="font-bold text-[17px] tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NexaBank
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-slate-400">
            {["Features", "Global Markets", "Security", "Company"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="text-[13.5px] font-medium text-slate-400 hover:text-white transition-colors px-3 py-2">
              Log in
            </button>
            <button className="text-[13.5px] font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 h-9 rounded-lg transition-colors shadow-lg shadow-blue-600/20 active:scale-95">
              Open account
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-20 lg:pt-32 grid lg:grid-cols-12 gap-12 items-center">

        {/* Left copy */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-[12px] font-semibold text-blue-400 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Live trading infrastructure
          </div>

          <h1 className="text-[clamp(36px,5vw,60px)] font-black tracking-tight leading-[1.08] bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Banking built for<br />global markets.
          </h1>

          <p className="text-[15.5px] text-slate-400 leading-[1.7] max-w-lg mx-auto lg:mx-0">
            Move money across borders, hold accounts in multiple currencies,
            and execute transfers with bank-grade routing —
            all with transparent, flat fees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <button className="w-full sm:w-auto px-6 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/15 active:scale-95 text-[14px]">
              Get started free
            </button>
            <button className="w-full sm:w-auto px-6 h-12 border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 font-medium rounded-xl transition-colors text-[14px]">
              Talk to our team
            </button>
          </div>

          {/* Trust line */}
          <p className="text-[12.5px] text-slate-600 pt-1">
            No monthly fees · FDIC insured · 2-minute setup
          </p>
        </div>

        {/* Right: converter widget */}
        <div className="lg:col-span-6 relative w-full max-w-md mx-auto">
          {/* Glow border */}
          <div className="absolute -inset-px bg-gradient-to-tr from-blue-600/40 to-emerald-500/40 rounded-2xl blur-sm opacity-60 pointer-events-none" />
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-center justify-between mb-5">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Live converter</p>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live rate
              </span>
            </div>

            {/* Send row */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 focus-within:border-slate-600 transition-colors mb-2">
              <label className="block text-[11px] font-medium text-slate-500 mb-1.5">You send</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-[22px] font-bold text-white focus:outline-none w-full tabular-nums"
                />
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg flex-shrink-0">
                  <span className="text-[13px]">🇺🇸</span>
                  <span className="text-[13px] font-bold text-slate-200">USD</span>
                </div>
              </div>
            </div>

            {/* Rate breakdown */}
            <div className="mx-4 my-3 pl-4 border-l-2 border-dashed border-slate-800 space-y-1.5">
              <div className="flex justify-between text-[12px] text-slate-500">
                <span>Fee (0.15%)</span>
                <span>${(Number(amount) * 0.0015 || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] font-semibold text-emerald-400">
                <span>Exchange rate</span>
                <span>1 USD = 1.0842 EUR</span>
              </div>
            </div>

            {/* Receive row */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-5">
              <label className="block text-[11px] font-medium text-slate-500 mb-1.5">They receive</label>
              <div className="flex items-center gap-3">
                <span className="text-[22px] font-bold text-slate-200 tabular-nums w-full">{received}</span>
                <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg flex-shrink-0">
                  <span className="text-[13px]">🇪🇺</span>
                  <span className="text-[13px] font-bold text-slate-200">EUR</span>
                </div>
              </div>
            </div>

            <button className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] rounded-xl transition-colors active:scale-95">
              Lock this rate →
            </button>

            <p className="text-center text-[11px] text-slate-600 mt-3">
              Rate valid for 60 seconds · No hidden markups
            </p>
          </div>
        </div>
      </section>

      {/* ── Logos / trust bar ── */}
      <div className="border-y border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-10 flex-wrap">
          <p className="text-[11.5px] font-semibold text-slate-600 tracking-widest uppercase">Trusted infrastructure</p>
          {["SWIFT", "SEPA", "ACH", "IBAN", "FedWire"].map((n) => (
            <span key={n} className="text-[13px] font-bold text-slate-700 tracking-widest">{n}</span>
          ))}
        </div>
      </div>

      {/* ── Bento features ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-[clamp(26px,4vw,38px)] font-black tracking-tight text-white leading-[1.1]">
            Everything in one place.
          </h2>
          <p className="text-[15px] text-slate-400 leading-relaxed">
            Built for teams that move money globally and need control, speed, and clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1 — wide, dashboard preview */}
          <div className="md:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/30 p-7 flex flex-col justify-between overflow-hidden group hover:border-slate-800 transition-all duration-300">
            <div className="space-y-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-base">📊</div>
              <h3 className="text-[17px] font-bold text-white">Real-time portfolio overview</h3>
              <p className="text-[13.5px] text-slate-400 leading-relaxed max-w-sm">
                Track balance movements, currency allocations, and position changes from a single dashboard.
              </p>
            </div>
            {/* Mini dashboard */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-900">
                <span className="text-[11px] font-semibold text-slate-500">Portfolio · All accounts</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/8 px-2 py-0.5 rounded">+12.4% YTD</span>
              </div>
              <div className="h-20 flex items-end gap-1.5">
                {[35, 50, 42, 68, 55, 80, 100].map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-t w-full transition-all ${i === 6 ? "bg-emerald-500/80" : i === 5 ? "bg-blue-600/80" : "bg-slate-800"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-3">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
                  <span key={m} className="text-[9px] text-slate-700">{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — security */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-7 flex flex-col justify-between hover:border-slate-800 transition-all duration-300 group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-base">🛡️</div>
              <h3 className="text-[17px] font-bold text-white">Bank-grade security</h3>
              <p className="text-[13.5px] text-slate-400 leading-relaxed">
                Multi-signature controls, hardware-bound keys, and instant account freezing — all in your hands.
              </p>
            </div>
            <div className="mt-8 space-y-2">
              {["AES-256 encryption", "2FA on all actions", "Instant freeze"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[12.5px] text-slate-500">
                  <span className="text-emerald-500 text-[10px]">✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 — multi-currency */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-7 flex flex-col justify-between hover:border-slate-800 transition-all duration-300">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 text-base">🌍</div>
              <h3 className="text-[17px] font-bold text-white">Multi-currency accounts</h3>
              <p className="text-[13.5px] text-slate-400 leading-relaxed">
                Hold, send, and receive in USD, EUR, GBP, and SGD. Local routing numbers included.
              </p>
            </div>
            <div className="mt-8 flex gap-2 flex-wrap">
              {["IBAN", "ACH", "SEPA", "SWIFT"].map((t) => (
                <span key={t} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[11.5px] font-semibold text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4 — support, wide */}
          <div className="md:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/30 p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-800 transition-all duration-300">
            <div className="space-y-2 max-w-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-base">💬</div>
              <h3 className="text-[17px] font-bold text-white">Dedicated support desk</h3>
              <p className="text-[13.5px] text-slate-400 leading-relaxed">
                Real people, not bots. Our payments team is available around the clock to resolve issues and flag anomalies before they become problems.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="px-5 py-2.5 rounded-xl border border-slate-700 text-[13.5px] font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-all">
                Contact support →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-12 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-600/10 blur-[80px] pointer-events-none" />
          <div className="relative">
            <h2 className="text-[clamp(28px,4vw,44px)] font-black tracking-tight text-white mb-4 leading-[1.1]">
              Ready to move money<br />like it's 2025?
            </h2>
            <p className="text-[15px] text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              Open a free account in under 2 minutes. No paperwork, no minimums.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button className="px-7 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors text-[14px] active:scale-95">
                Get started free
              </button>
              <button className="px-7 h-12 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-xl transition-all text-[14px]">
                Talk to sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-900 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-xs">N</div>
            <span className="font-bold text-[14px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">NexaBank</span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Security", "Status"].map((l) => (
              <a key={l} href="#" className="text-[12.5px] text-slate-600 hover:text-slate-400 transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-[12px] text-slate-700">© 2025 NexaBank</p>
        </div>
      </footer>

    </div>
  );
}
 
