import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#f0f7f4]/80 backdrop-blur-md border-b border-[#d4ebe0]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f4f2f] flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-[#0f2419] font-semibold text-[15px] tracking-tight">
              Nexa<span className="text-[#1a7a4a]">Bank</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#2d5042] hover:text-[#0f2419] transition-colors px-4 py-2 rounded-xl hover:bg-[#e4f2ec]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#0f4f2f] hover:bg-[#0a3d24] text-white px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Open account
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#c8f0da]/40 blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#d4ebe0]/50 blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#e4f7ed] border border-[#a8dfc0] text-[#1a7a4a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure. Modern. Always available.
            </div>

            <h1
              className="text-5xl lg:text-6xl font-bold text-[#0f2419] leading-[1.1] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Banking that works{" "}
              <span className="text-[#1a7a4a] italic">for you</span>
            </h1>

            <p className="text-[#4a7060] text-lg leading-relaxed mb-10 max-w-lg">
              Open a NexaBank account in minutes. Send money globally, manage your
              finances, and stay in control — all from your phone.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#0f4f2f] hover:bg-[#0a3d24] text-white font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#0f4f2f]/20 text-sm"
              >
                Open a free account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#f5faf7] text-[#0f2419] font-semibold px-6 py-3.5 rounded-2xl border border-[#c8dfd5] transition-all text-sm"
              >
                Log in to your account
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5 mt-10">
              {[
                "No monthly fees",
                "256-bit encryption",
                "Instant transfers",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[13px] text-[#4a7060]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1a7a4a]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Floating card mockup */}
          <div className="absolute right-6 top-16 hidden lg:block">
            <div className="w-72 bg-white rounded-3xl shadow-2xl shadow-[#0f2419]/10 border border-[#e4f2ec] p-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-semibold text-[#6a8c7a] uppercase tracking-widest">Main Balance</p>
                  <p className="text-3xl font-bold text-[#0f2419] mt-0.5" style={{ fontFamily: "monospace" }}>€12,450.00</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#0f4f2f] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Transfer to Sarah", amount: "−€250.00", color: "text-rose-500" },
                  { label: "Salary credit",     amount: "+€3,200.00", color: "text-emerald-600" },
                  { label: "Netflix",           amount: "−€15.99",  color: "text-rose-500" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between py-2 border-b border-[#f0f7f4] last:border-0">
                    <p className="text-[12px] text-[#2d5042] font-medium">{t.label}</p>
                    <p className={`text-[12px] font-semibold font-mono ${t.color}`}>{t.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-y border-[#d4ebe0]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-bold text-[#0f2419] mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Whatever you need
            </h2>
            <p className="text-[#4a7060] text-sm max-w-md mx-auto">
              NexaBank gives you powerful tools to manage your money — securely and effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Zap,
                title: "Instant Transfers",
                desc: "Send money locally or internationally in seconds.",
              },
              {
                icon: Lock,
                title: "Bank-Grade Security",
                desc: "Your account is protected with 256-bit encryption and KYC verification.",
              },
              {
                icon: Globe,
                title: "Global Reach",
                desc: "Send to any account worldwide with competitive rates.",
              },
              {
                icon: Smartphone,
                title: "Always Available",
                desc: "Access your account 24/7 from any device, anywhere.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-[#d4ebe0] bg-[#f9fdfa] hover:bg-white hover:shadow-md hover:shadow-[#0f2419]/5 hover:border-[#a8dfc0] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e4f7ed] flex items-center justify-center mb-4 group-hover:bg-[#0f4f2f] transition-colors">
                  <Icon className="w-5 h-5 text-[#1a7a4a] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-[14px] font-semibold text-[#0f2419] mb-1.5">{title}</h3>
                <p className="text-[12px] text-[#6a8c7a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2
            className="text-3xl font-bold text-[#0f2419] mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Get started in minutes
          </h2>
          <p className="text-[#4a7060] text-sm">Three simple steps to your new account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Create your account",
              desc: "Sign up with your email and set a secure password. Takes less than 2 minutes.",
            },
            {
              step: "02",
              title: "Verify your identity",
              desc: "Submit your ID and personal details. Our team reviews and approves within 24 hours.",
            },
            {
              step: "03",
              title: "Start banking",
              desc: "Your account number is ready. Send, receive, and manage funds instantly.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="relative p-7 rounded-2xl bg-white border border-[#d4ebe0] shadow-sm">
              <span
                className="block text-6xl font-bold text-[#e4f2ec] mb-4 leading-none"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {step}
              </span>
              <h3 className="text-[15px] font-semibold text-[#0f2419] mb-2">{title}</h3>
              <p className="text-[12px] text-[#6a8c7a] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#0f4f2f] p-10 text-center">
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 50%, #22c55e 0%, transparent 50%)"
            }}
          />
          <div className="relative">
            <CreditCard className="w-10 h-10 text-[#6ee7a0] mx-auto mb-4" />
            <h2
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Ready to get started?
            </h2>
            <p className="text-[#a8dfc0] text-sm mb-8 max-w-sm mx-auto">
              Join thousands of customers who trust NexaBank for their everyday banking needs.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#f0f7f4] text-[#0f4f2f] font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg"
              >
                Open a free account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-all text-sm"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#d4ebe0] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0f4f2f] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">N</span>
            </div>
            <span className="text-[13px] text-[#4a7060] font-medium">NexaBank</span>
          </div>
          <p className="text-[12px] text-[#6a8c7a]">
            © {new Date().getFullYear()} NexaBank. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Support"].map((item) => (
              <a key={item} href="#" className="text-[12px] text-[#6a8c7a] hover:text-[#0f2419] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
