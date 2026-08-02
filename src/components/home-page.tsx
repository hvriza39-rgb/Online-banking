'use client' 
import Link from "next/link";
import Image from "next/image";
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
          <div className="flex items-center">
            <Image src="/nexabank-logo.svg" alt="NexaBank" width={130} height={36} />
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
      <section className="relative overflow-hidden min-h-[600px]">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <Image
            src="/hero.jpg"
            alt="Banking hero"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-[#0f2419]/60" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure. Modern. Always available.
            </div>

            <h1
              className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Banking that works{" "}
              <span className="text-[#6ee7a0] italic">for you</span>
            </h1>

            <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-lg">
              Open a NexaBank account in minutes. Send money globally, manage your
              finances, and stay in control. 
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#0f4f2f] hover:bg-[#0a3d24] text-white font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-lg text-sm"
              >
                Open a free account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3.5 rounded-2xl border border-white/30 transition-all text-sm"
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
                <div key={item} className="flex items-center gap-1.5 text-[13px] text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6ee7a0]" />
                  {item}
                </div>
              ))}
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
              NexaBank gives you powerful tools to manage your money securely and effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Zap,        title: "Instant Transfers", desc: "Send money locally or internationally in seconds." },
              
              { icon: Globe,      title: "Global Reach", desc: "Send to any account worldwide with competitive rates." },
              { icon: Smartphone, title: "Always Available", desc: "Access your account 24/7 from any device, anywhere." },
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

      {/* ── Customer section ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-xl shadow-[#0f2419]/10">
            <Image
              src="/customer.jpg"
              alt="Happy NexaBank customer"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2419]/40 to-transparent" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-[#e4f7ed] border border-[#a8dfc0] text-[#1a7a4a] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Trusted by thousands
            </div>
            <h2
              className="text-3xl font-bold text-[#0f2419] mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Banking you can actually enjoy
            </h2>
            <p className="text-[#4a7060] text-sm leading-relaxed mb-6">
              Our customers love the simplicity and power of NexaBank. From instant transfers to real-time alerts made for you.
            </p>
            <div className="space-y-3">
              {[
                "Instant transfer",
                "24/7 customer support",
                "Zero hidden fees",
                "Full transaction history",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-[13px] text-[#2d5042]">
                  <CheckCircle2 className="w-4 h-4 text-[#1a7a4a] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Card section ── */}
      <section className="bg-[#0f2419]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <CreditCard className="w-3.5 h-3.5" />
                Your NexaBank Card
              </div>
              <h2
                className="text-3xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                One card for everything
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Pay anywhere in the world with your NexaBank debit card. Shop online, withdraw cash, or tap to pay in real-time
              </p>
              <div className="space-y-3">
                {[
                  "Accepted worldwide",
                  "Freeze & unfreeze instantly",
                  "Real-time spending alerts",
                  "Zero foreign transaction fees",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-[13px] text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#6ee7a0] flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/card.jpg"
                alt="NexaBank card"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2419]/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Retirement / savings section ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-xl shadow-[#0f2419]/10 order-2 lg:order-1">
            <Image
              src="/retirement.jpg"
              alt="Plan for your future"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2419]/40 to-transparent" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-[#e4f7ed] border border-[#a8dfc0] text-[#1a7a4a] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Globe className="w-3.5 h-3.5" />
              Plan your future
            </div>
            <h2
              className="text-3xl font-bold text-[#0f2419] mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Save for what matters most
            </h2>
            <p className="text-[#4a7060] text-sm leading-relaxed mb-6">
              Whether you're saving for retirement, a home, or your children's future — NexaBank gives you the tools to get there.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#0f4f2f] hover:bg-[#0a3d24] text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
            >
              Start saving today
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-y border-[#d4ebe0]">
        <div className="max-w-5xl mx-auto px-6 py-20">
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
              { step: "01", title: "Create your account", desc: "Sign up with your email and set a secure password. Takes less than 2 minutes." },
              { step: "02", title: "Verify your identity", desc: "Submit your ID and personal details. Our team reviews and approves within 24 hours." },
              { step: "03", title: "Start banking", desc: "Your account number is ready. Send, receive, and manage funds instantly." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative p-7 rounded-2xl bg-[#f9fdfa] border border-[#d4ebe0] shadow-sm">
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
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
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
          <div className="flex items-center">
            <Image src="/nexabank-logo.svg" alt="NexaBank" width={90} height={24} />
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
