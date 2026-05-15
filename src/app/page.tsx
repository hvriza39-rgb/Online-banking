import Link from "next/link";
import { ShieldCheck, Zap, Globe, Monitor, BadgeCheck, BarChart2 } from "lucide-react";

export default function LandingPage() {
  const stats = [
    { n: "Free",      l: "No monthly fees, ever" },
    { n: "USD & EUR", l: "Two currencies, one account" },
    { n: "Instant",   l: "Balance updates in real time" },
    { n: "KYC once",  l: "Verify once, use forever" },
  ];

  const features = [
    {
      tag: "BALANCE",
      title: "See exactly where you stand",
      desc: "Your balance updates the moment a transaction hits. No delays, no confusion — just the real number, always.",
      visual: (
        <div className="bg-[#0c0e12] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#1a9068]/10 pointer-events-none" />
          <p className="text-[10px] font-bold text-[#636878] uppercase tracking-[0.1em] mb-2.5">Main Balance</p>
          <p className="font-mono text-[36px] font-semibold text-white tracking-tight mb-4">$5,000.00</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#c0c4cc]">James Tester</p>
              <p className="font-mono text-[11px] text-[#636878] mt-1">92182 69064</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.07em] bg-[#1a9068]/20 text-[#1a9068] px-3 py-1 rounded-full border border-[#1a9068]/30">
              Active
            </span>
          </div>
        </div>
      ),
    },
    {
      tag: "HISTORY",
      title: "Every transaction, crystal clear",
      desc: "Full logs with timestamps, notes, and a running balance after every credit and debit.",
      visual: (
        <div className="bg-white rounded-2xl border border-[#e2e5ea] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e5ea]">
            <span className="text-[13px] font-bold text-[#0c0e12]">Recent Activity</span>
            <span className="text-[12px] font-semibold text-[#1a9068]">View all</span>
          </div>
          {[
            { l: "Credit",     t: "Today, 9:41 AM",      a: "+$5,000.00", green: true  },
            { l: "Debit",      t: "Yesterday, 2:15 PM",  a: "−$120.00",   green: false },
            { l: "Withdrawal", t: "Dec 12, 11:02 AM",    a: "−$50.00",    green: false },
          ].map((tx, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-3 ${i < 2 ? "border-b border-[#f3f4f7]" : ""}`}>
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-sm flex-shrink-0 ${tx.green ? "bg-[#edf7f3] text-[#1a9068]" : "bg-[#f3f4f7] text-[#4b5262]"}`}>
                {tx.green ? "↙" : "↗"}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#0c0e12]">{tx.l}</p>
                <p className="text-[11px] text-[#9aa0ad] mt-0.5">{tx.t}</p>
              </div>
              <p className={`font-mono text-[13px] font-bold ${tx.green ? "text-[#1a9068]" : "text-[#0c0e12]"}`}>{tx.a}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      tag: "SECURITY",
      title: "Security you can actually feel",
      desc: "KYC verification, 256-bit encryption, and real-time fraud monitoring protect every account.",
      visual: (
        <div className="bg-gradient-to-br from-[#0c0e12] to-[#1a1e26] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 bg-[#1a9068]/20 border-2 border-[#1a9068]/40 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#1a9068]" />
          </div>
          <p className="text-[15px] font-bold text-white mb-2">Verified &amp; Protected</p>
          <p className="text-[12.5px] text-[#636878] leading-relaxed mb-5">
            Your identity is verified once.<br />Transfers and your account number unlock instantly.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {["256-bit SSL", "KYC Verified", "FDIC Partner"].map((t) => (
              <span key={t} className="text-[10.5px] font-bold text-[#1a9068] bg-[#1a9068]/15 border border-[#1a9068]/25 px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 h-[60px] px-10 flex items-center justify-between bg-[#f8f9fb]/90 backdrop-blur-md border-b border-[#e2e5ea]">
        <NexaLogo />
        <div className="flex items-center gap-2.5">
          <Link href="/login"
            className="px-[18px] py-2 rounded-[9px] border border-[#e2e5ea] text-[#4b5262] text-[13.5px] font-semibold hover:border-[#0c0e12] hover:text-[#0c0e12] transition-all">
            Sign in
          </Link>
          <Link href="/register"
            className="px-[18px] py-2 rounded-[9px] bg-[#0c0e12] text-white text-[13.5px] font-bold hover:bg-[#1e2229] transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#0c0e12] to-[#131720] px-10 pt-24 pb-20 text-center relative overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(26,144,104,0.15)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute -bottom-16 right-[10%] w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(59,110,245,0.08)_0%,transparent_65%)] pointer-events-none" />

        <div className="relative max-w-[760px] mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#1a9068]/[0.15] border border-[#1a9068]/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a9068] inline-block" />
            <span className="text-[11.5px] font-bold text-[#1a9068] tracking-[0.06em]">PERSONAL BANKING · NOW OPEN</span>
          </div>

          <h1 className="text-[clamp(42px,7vw,72px)] font-black text-white leading-[1.05] tracking-[-0.05em] mb-6">
            Banking that gets<br />
            <span className="bg-gradient-to-r from-[#1a9068] to-[#4ecda4] bg-clip-text text-transparent">
              out of your way.
            </span>
          </h1>

          <p className="text-[clamp(15px,2.5vw,18px)] text-[#7a8494] leading-[1.7] max-w-[480px] mx-auto mb-11">
            A personal account with real-time balance, secure transfers,
            and complete transaction history — all in one clean dashboard.
          </p>

          {/* Email capture */}
          <div className="flex max-w-[440px] mx-auto mb-5 bg-white/[0.06] border border-white/10 rounded-xl p-1.5 gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none outline-none px-4 py-2.5 text-[14px] text-white placeholder:text-[#444c5a]"
            />
            <Link href="/register"
              className="px-5 py-2.5 rounded-[8px] bg-[#1a9068] hover:bg-[#15755a] text-white text-[14px] font-bold transition-colors flex-shrink-0">
              Open account →
            </Link>
          </div>
          <p className="text-[12.5px] text-[#444c5a]">Free to open · No credit check · Takes 2 minutes</p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-[#e2e5ea]">
        <div className="max-w-[900px] mx-auto px-10 grid grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.l} className={`py-7 text-center ${i < 3 ? "border-r border-[#e2e5ea]" : ""}`}>
              <p className="text-[26px] font-black text-[#0c0e12] tracking-[-0.04em] mb-1">{s.n}</p>
              <p className="text-[12.5px] text-[#9aa0ad]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features (alternating) ── */}
      <section className="max-w-[900px] mx-auto px-10 pt-24 pb-16">
        <div className="text-center mb-[70px]">
          <p className="text-[11px] font-extrabold text-[#1a9068] tracking-[0.1em] uppercase mb-3">HOW IT WORKS</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-black text-[#0c0e12] tracking-[-0.04em] leading-[1.1]">
            Everything you need,<br />nothing you don&apos;t.
          </h2>
        </div>

        <div className="flex flex-col gap-20">
          {features.map(({ tag, title, desc, visual }, i) => (
            <div key={tag} className="grid grid-cols-2 gap-16 items-center">
              <div className={i % 2 === 0 ? "order-0" : "order-1"}>
                <p className="text-[11px] font-extrabold text-[#1a9068] tracking-[0.1em] mb-3.5">{tag}</p>
                <h3 className="text-[clamp(22px,3vw,30px)] font-extrabold text-[#0c0e12] tracking-[-0.04em] leading-[1.2] mb-4">{title}</h3>
                <p className="text-[15.5px] text-[#4b5262] leading-[1.7]">{desc}</p>
                <Link href="/register"
                  className="mt-6 inline-flex items-center gap-2 text-[14px] font-bold text-[#0c0e12] hover:opacity-60 transition-opacity">
                  Get started →
                </Link>
              </div>
              <div className={`${i % 2 === 0 ? "order-1" : "order-0"} animate-[float_5s_ease-in-out_infinite]`}>
                {visual}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white border-y border-[#e2e5ea] py-[72px] px-10">
        <div className="max-w-[840px] mx-auto">
          <p className="text-[11px] font-extrabold text-[#1a9068] tracking-[0.1em] uppercase mb-3 text-center">WHAT PEOPLE SAY</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-black text-[#0c0e12] tracking-[-0.04em] text-center mb-12">
            Trusted by thousands
          </h2>
          <div className="grid grid-cols-3 gap-5">
            {[
              { q: "Finally a banking app that doesn't feel like it was built in 2008.", name: "Sarah K.", role: "Freelance designer" },
              { q: "Verification took 4 minutes. Account was active immediately after.", name: "Marcus T.", role: "Software engineer" },
              { q: "The transaction history is exactly what I needed to track my spending.", name: "Priya M.", role: "Product manager" },
            ].map(({ q, name, role }) => (
              <div key={name} className="bg-[#f8f9fb] border border-[#e2e5ea] rounded-2xl p-5">
                <p className="text-[14px] text-[#4b5262] leading-[1.65] mb-4 italic">&ldquo;{q}&rdquo;</p>
                <p className="text-[13px] font-bold text-[#0c0e12]">{name}</p>
                <p className="text-[12px] text-[#9aa0ad] mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0c0e12] px-10 py-24 text-center relative overflow-hidden">
        <div className="absolute -top-20 left-[30%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(26,144,104,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="relative max-w-[560px] mx-auto">
          <h2 className="text-[clamp(30px,5vw,52px)] font-black text-white tracking-[-0.05em] leading-[1.1] mb-4">
            Open your account<br />today.
          </h2>
          <p className="text-[16px] text-[#525c6a] mb-9">Free, fast, and secure. Set up in under two minutes.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/register"
              className="px-8 py-3.5 rounded-[11px] bg-white text-[#0c0e12] text-[15px] font-extrabold tracking-[-0.02em] hover:opacity-90 transition-opacity">
              Create free account →
            </Link>
            <Link href="/login"
              className="px-7 py-3.5 rounded-[11px] border border-white/15 text-[#7a8494] text-[15px] font-semibold hover:border-white/35 hover:text-white transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0c0e12] border-t border-[#272b33] px-10 py-7 flex items-center justify-between flex-wrap gap-3">
        <NexaLogo light />
        <div className="flex gap-7">
          {["Privacy", "Terms", "Security", "Contact"].map((l) => (
            <span key={l} className="text-[13px] text-[#363d47] hover:text-[#7a8494] cursor-pointer transition-colors">{l}</span>
          ))}
        </div>
        <p className="text-[12px] text-[#2a3038]">© 2025 NexaBank</p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-9px); }
        }
      `}</style>
    </div>
  );
}

function NexaLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center flex-shrink-0 ${light ? "bg-white" : "bg-[#0c0e12]"}`}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1.3" fill="#1a9068" />
          <rect x="9" y="2" width="5" height="5" rx="1.3" fill={light ? "#0c0e12" : "white"} opacity=".4" />
          <rect x="2" y="9" width="5" height="5" rx="1.3" fill={light ? "#0c0e12" : "white"} opacity=".4" />
          <rect x="9" y="9" width="5" height="5" rx="1.3" fill="#1a9068" opacity=".6" />
        </svg>
      </div>
      <span className={`text-[16px] font-extrabold tracking-[-0.035em] ${light ? "text-white" : "text-[#0c0e12]"}`}>
        NexaBank
      </span>
    </div>
  );
}
