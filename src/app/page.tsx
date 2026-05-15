'use client' 

import { useState } from "react";

// Unsplash photo URLs — free, no auth needed
const PHOTOS = {
  hero:     "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=80&fit=crop",   // person phone + card
  transfer: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80&fit=crop", // woman laptop
  security: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80&fit=crop", // lock/security
  global:   "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80&fit=crop", // world/cards
};

export default function NexaBankLanding() {
  const [amount, setAmount]   = useState("1000");
  const [page, setPage]       = useState("landing"); // landing | login | register

  const received = isNaN(Number(amount))
    ? "0.00"
    : (Number(amount) * 1.0842 - Number(amount) * 0.0015).toFixed(2);

  if (page === "login") return <PlaceholderPage title="Sign in" back={() => setPage("landing")} />;
  if (page === "register") return <PlaceholderPage title="Create account" back={() => setPage("landing")} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500/30 overflow-x-hidden">

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm select-none">N</div>
            <span className="font-black text-[17px] tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">NexaBank</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-slate-400">
            {["Features", "Global Markets", "Security", "Company"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage("login")}
              className="text-[13.5px] font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
            >Log in</button>
            <button
              onClick={() => setPage("register")}
              className="text-[13.5px] font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 h-9 rounded-lg transition-colors shadow-lg shadow-blue-600/20 active:scale-95"
            >Open account</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-20 lg:pt-28 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-[12px] font-semibold text-blue-400 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Live trading infrastructure
          </div>

          <h1 className="text-[clamp(38px,5vw,62px)] font-black tracking-tight leading-[1.07] bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Banking built<br />for global<br />markets.
          </h1>

          <p className="text-[15.5px] text-slate-400 leading-[1.75] max-w-lg mx-auto lg:mx-0">
            Move money across borders, hold accounts in multiple currencies,
            and execute transfers with bank-grade routing —
            all with transparent, flat fees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              onClick={() => setPage("register")}
              className="w-full sm:w-auto px-7 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/15 active:scale-95 text-[14px]"
            >Get started free</button>
            <button className="w-full sm:w-auto px-7 h-12 border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 font-medium rounded-xl transition-colors text-[14px]">
              Talk to our team
            </button>
          </div>
          <p className="text-[12.5px] text-slate-600">No monthly fees · FDIC insured · 2-minute setup</p>
        </div>

        {/* Right: photo + converter widget layered */}
        <div className="lg:col-span-6 relative w-full max-w-lg mx-auto h-[480px]">
          {/* Background photo */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <img
              src={PHOTOS.hero}
              alt="Person using NexaBank on mobile"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>

          {/* Converter widget — floats over photo */}
          <div className="absolute bottom-0 left-0 right-0 mx-4">
            <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/90 backdrop-blur-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Live converter</p>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live rate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 focus-within:border-slate-600 transition-colors">
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">You send</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent text-[18px] font-bold text-white focus:outline-none w-full tabular-nums"
                    />
                    <span className="text-[12px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg flex-shrink-0">USD</span>
                  </div>
                </div>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">They receive</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[18px] font-bold text-slate-200 tabular-nums w-full">{received}</span>
                    <span className="text-[12px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg flex-shrink-0">EUR</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 mb-3 px-1">
                <span>Fee: ${(Number(amount) * 0.0015 || 0).toFixed(2)} (0.15%)</span>
                <span className="text-emerald-400 font-semibold">1 USD = 1.0842 EUR</span>
              </div>

              <button
                onClick={() => setPage("register")}
                className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[13.5px] rounded-xl transition-colors active:scale-95"
              >Lock this rate →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="border-y border-slate-900 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-10 flex-wrap">
          <p className="text-[11px] font-bold text-slate-600 tracking-widest uppercase">Trusted infrastructure</p>
          {["SWIFT", "SEPA", "ACH", "IBAN", "FedWire"].map((n) => (
            <span key={n} className="text-[13px] font-bold text-slate-700 tracking-widest">{n}</span>
          ))}
        </div>
      </div>

      {/* ── Feature: Transfer (photo left, copy right) ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Photo with UI mockup overlay */}
          <div className="relative rounded-2xl overflow-hidden h-[400px]">
            <img src={PHOTOS.transfer} alt="Professional using NexaBank" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/80" />
            {/* Floating UI card */}
            <div className="absolute bottom-6 right-6 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 w-56 shadow-2xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Last transfer</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">↙</div>
                <div>
                  <p className="text-[13px] font-bold text-white">+$5,000.00</p>
                  <p className="text-[11px] text-slate-500">Today, 9:41 AM</p>
                </div>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">Cleared in 4 seconds</p>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[11px] font-bold text-blue-400 tracking-[0.1em] uppercase">Transfers</p>
            <h2 className="text-[clamp(26px,4vw,38px)] font-black tracking-tight text-white leading-[1.1]">
              Send money<br />anywhere, instantly.
            </h2>
            <p className="text-[15px] text-slate-400 leading-[1.75]">
              Your balance updates the moment a transaction hits.
              Flat 0.15% fee, no hidden markups, no FX spread games.
              USD, EUR, GBP, and SGD all supported out of the box.
            </p>
            <div className="space-y-3 pt-2">
              {[
                "Cleared in seconds, not days",
                "Local routing numbers in every supported currency",
                "Full transaction history with notes and timestamps",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3 text-[13.5px] text-slate-300">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={() => setPage("register")} className="mt-2 inline-flex items-center gap-2 text-[14px] font-bold text-white hover:opacity-70 transition-opacity">
              Open your account →
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature: Security (copy left, photo right) ── */}
      <section id="security" className="max-w-7xl mx-auto px-6 py-8 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-5 order-2 lg:order-1">
            <p className="text-[11px] font-bold text-emerald-400 tracking-[0.1em] uppercase">Security</p>
            <h2 className="text-[clamp(26px,4vw,38px)] font-black tracking-tight text-white leading-[1.1]">
              Security you can<br />actually feel.
            </h2>
            <p className="text-[15px] text-slate-400 leading-[1.75]">
              KYC verification, AES-256 encryption, and real-time fraud
              monitoring on every account. Verify once — your account number
              and transfers unlock instantly.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: "AES-256", sub: "Encryption" },
                { label: "2FA",     sub: "All actions" },
                { label: "KYC",     sub: "One-time verify" },
                { label: "24/7",    sub: "Fraud monitoring" },
              ].map(({ label, sub }) => (
                <div key={label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
                  <p className="text-[15px] font-black text-white">{label}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo with overlay badge */}
          <div className="relative rounded-2xl overflow-hidden h-[400px] order-1 lg:order-2">
            <img src={PHOTOS.security} alt="Security infrastructure" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 text-sm">🛡️</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">Verified & Protected</p>
                <p className="text-[11px] text-emerald-400">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento features grid ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24 border-t border-slate-900 pt-24">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-[clamp(26px,4vw,38px)] font-black tracking-tight text-white leading-[1.1]">Everything in one place.</h2>
          <p className="text-[15px] text-slate-400 leading-relaxed">Built for people who move money globally and need control, speed, and clarity.</p>
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
            {/* Mini UI mockup */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-900">
                <span className="text-[11px] font-semibold text-slate-500">Portfolio · All accounts</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/8 px-2 py-0.5 rounded">+12.4% YTD</span>
              </div>
              <div className="h-20 flex items-end gap-1.5">
                {[35, 50, 42, 68, 55, 80, 100].map((h, i) => (
                  <div key={i}
                    className={`rounded-t w-full transition-all ${i === 6 ? "bg-emerald-500/80" : i === 5 ? "bg-blue-600/80" : "bg-slate-800"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
                  <span key={m} className="text-[9px] text-slate-700">{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — global photo card */}
          <div className="rounded-2xl overflow-hidden relative h-64 md:h-auto group hover:border-slate-700 transition-all">
            <img src={PHOTOS.global} alt="Global banking" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute bottom-0 p-6 space-y-1">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm mb-3">🌍</div>
              <h3 className="text-[16px] font-bold text-white">Multi-currency accounts</h3>
              <p className="text-[12.5px] text-slate-400 leading-relaxed">USD, EUR, GBP & SGD. Local routing included.</p>
              <div className="flex gap-1.5 pt-2 flex-wrap">
                {["IBAN", "ACH", "SEPA", "SWIFT"].map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-slate-900/80 border border-slate-700 rounded-full text-[10.5px] font-semibold text-slate-400">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 — security */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-7 flex flex-col justify-between hover:border-slate-800 transition-all duration-300">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-base">🛡️</div>
              <h3 className="text-[17px] font-bold text-white">Bank-grade security</h3>
              <p className="text-[13.5px] text-slate-400 leading-relaxed">
                Multi-signature controls, hardware-bound keys, and instant account freezing.
              </p>
            </div>
            <div className="mt-8 space-y-2.5">
              {["AES-256 encryption", "2FA on all actions", "Instant account freeze"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[12.5px] text-slate-500">
                  <span className="text-emerald-500 text-[10px]">✓</span>{f}
                </div>
              ))}
            </div>
          </div>

          {/* Card 4 — support wide */}
          <div className="md:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/30 p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-800 transition-all duration-300">
            <div className="space-y-2 max-w-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-base">💬</div>
              <h3 className="text-[17px] font-bold text-white">Dedicated support desk</h3>
              <p className="text-[13.5px] text-slate-400 leading-relaxed">
                Real people, not bots. Our payments team is available around the clock to resolve issues before they become problems.
              </p>
            </div>
            <button className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-slate-700 text-[13.5px] font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-all">
              Contact support →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative rounded-2xl overflow-hidden border border-slate-800">
          {/* Background photo */}
          <img src={PHOTOS.hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-600/10 blur-[80px] pointer-events-none" />
          <div className="relative p-12 text-center">
            <h2 className="text-[clamp(28px,4vw,44px)] font-black tracking-tight text-white mb-4 leading-[1.1]">
              Ready to move money<br />like it's 2025?
            </h2>
            <p className="text-[15px] text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              Open a free account in under 2 minutes. No paperwork, no minimums.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => setPage("register")}
                className="px-7 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors text-[14px] active:scale-95"
              >Get started free</button>
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
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-xs">N</div>
            <span className="font-black text-[14px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">NexaBank</span>
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

/* ── Placeholder login/register screens ── */
function PlaceholderPage({ title, back }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 font-sans">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-sm">N</div>
        <span className="font-black text-[17px] tracking-tight text-white">NexaBank</span>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-sm w-full mx-6">
        <h1 className="text-[22px] font-black text-white mb-2">{title}</h1>
        <p className="text-[13.5px] text-slate-500 mb-6">Your actual auth page connects here.</p>
        <div className="h-px bg-slate-800 mb-6" />
        <button onClick={back} className="text-[13.5px] text-slate-400 hover:text-white transition-colors">
          ← Back to landing
        </button>
      </div>
    </div>
  );
}
