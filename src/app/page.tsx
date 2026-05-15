import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Zap, BarChart2, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  // Redirect logged-in users straight to dashboard
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div
      className="min-h-screen bg-[#F2EDE6] overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        .display { font-family: 'Playfair Display', Georgia, serif; }

        /* Ticker — GPU-only transform, no layout thrash */
        @keyframes ticker {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .ticker-inner {
          display: inline-flex;
          will-change: transform;
          animation: ticker 28s linear infinite;
        }
        .ticker-wrap { overflow: hidden; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translate3d(0, 24px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .fade-up   { animation: fadeUp 0.75s cubic-bezier(.16,1,.3,1) both; }
        .delay-1   { animation-delay: 0.08s; }
        .delay-2   { animation-delay: 0.2s; }
        .delay-3   { animation-delay: 0.34s; }
        .delay-4   { animation-delay: 0.48s; }

        .card-hover {
          transition: transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease;
          will-change: transform;
        }
        .card-hover:hover {
          transform: translate3d(0, -5px, 0);
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
        }

        .btn-primary {
          transition: transform 0.2s cubic-bezier(.16,1,.3,1), box-shadow 0.2s ease;
          will-change: transform;
        }
        .btn-primary:hover {
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 10px 24px rgba(26,60,40,0.25);
        }

        .link-ul {
          background-image: linear-gradient(currentColor, currentColor);
          background-size: 0% 1.5px;
          background-position: 0 100%;
          background-repeat: no-repeat;
          transition: background-size 0.28s ease;
        }
        .link-ul:hover { background-size: 100% 1.5px; }

        .feature-num {
          font-family: 'Playfair Display', serif;
          font-size: 100px;
          font-weight: 900;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1.5px #C8B89A;
          user-select: none;
          pointer-events: none;
          display: block;
        }

        .dark-section {
          background-color: #1A3C28;
        }
      `}</style>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 h-[62px] px-8 md:px-14 flex items-center justify-between"
        style={{
          background: "rgba(242,237,230,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(180,160,130,0.2)",
        }}
      >
        <NexaLogo />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="link-ul text-[13.5px] font-medium text-[#4A4035] px-1 py-1 tracking-wide"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="btn-primary ml-3 px-5 py-[9px] rounded-full text-[13.5px] font-semibold text-[#F2EDE6] tracking-wide"
            style={{ background: "#1A3C28" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative px-8 md:px-14 pt-20 md:pt-28 pb-16 md:pb-24 overflow-hidden">
        {/* Decorative circles — no animation, no repaints */}
        <div
          className="absolute top-10 right-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(26,60,40,0.07) 0%, transparent 70%)",
            border: "1px solid rgba(26,60,40,0.06)",
          }}
        />
        <div
          className="absolute bottom-0 left-[10%] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(200,184,154,0.2) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-[1100px] mx-auto">
          {/* Badge */}
          <div
            className="fade-up delay-1 inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full"
            style={{
              border: "1px solid rgba(26,60,40,0.2)",
              background: "rgba(26,60,40,0.05)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "#4DAA70" }}
            />
            <span className="text-[11.5px] font-semibold tracking-[0.1em] text-[#1A3C28] uppercase">
              Personal Banking · Now Open
            </span>
          </div>

          {/* Headline */}
          <h1
            className="display fade-up delay-2 text-[#1A1A14] leading-[1.04] mb-8"
            style={{
              fontSize: "clamp(52px, 9vw, 100px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            Banking that
            <br />
            <span style={{ fontStyle: "italic", color: "#1A3C28" }}>gets out</span>
            <br />
            of your way.
          </h1>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start md:items-end">
            <p
              className="fade-up delay-3 text-[17px] md:text-[18px] text-[#6B5F4E] leading-[1.75] max-w-[380px]"
              style={{ fontWeight: 300 }}
            >
              A personal account with real‑time balance, secure transfers, and complete
              transaction history — in one clean dashboard.
            </p>
            <div className="fade-up delay-4 flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                href="/register"
                className="btn-primary px-8 py-4 rounded-full text-[15px] font-semibold text-[#F2EDE6] tracking-wide text-center"
                style={{ background: "#1A3C28" }}
              >
                Open free account →
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-full text-[15px] font-medium text-[#4A4035] text-center"
                style={{
                  border: "1.5px solid rgba(74,64,53,0.25)",
                  transition: "border-color 0.2s",
                }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div
        className="ticker-wrap py-4 border-y"
        style={{
          borderColor: "rgba(180,160,130,0.25)",
          background: "rgba(26,60,40,0.04)",
        }}
      >
        <div className="ticker-inner">
          {Array(2)
            .fill(null)
            .map((_, i) => (
              <span key={i} className="inline-flex">
                {[
                  "Free to open",
                  "Real-time balance",
                  "256-bit encryption",
                  "KYC verified",
                  "USD & EUR",
                  "No monthly fees",
                  "Instant updates",
                  "Secure transfers",
                ].map((t) => (
                  <span key={t} className="inline-flex items-center gap-5 px-6">
                    <span className="text-[12px] font-semibold tracking-[0.12em] text-[#6B5F4E] uppercase whitespace-nowrap">
                      {t}
                    </span>
                    <span style={{ color: "#C8B89A", fontSize: 18 }}>◆</span>
                  </span>
                ))}
              </span>
            ))}
        </div>
      </div>

      {/* ── Numbers ── */}
      <section className="px-8 md:px-14 py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{
              background: "rgba(180,160,130,0.2)",
              border: "1px solid rgba(180,160,130,0.2)",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {[
              { n: "Free",    l: "No monthly fees, ever" },
              { n: "2 min",   l: "Average setup time" },
              { n: "USD & €", l: "Two currencies, one account" },
              { n: "1×",      l: "KYC verification, once" },
            ].map((s) => (
              <div key={s.l} className="py-10 px-8 text-center" style={{ background: "#F2EDE6" }}>
                <p
                  className="display mb-2"
                  style={{
                    fontSize: "clamp(32px,5vw,52px)",
                    color: "#1A3C28",
                    fontWeight: 900,
                    fontStyle: "italic",
                  }}
                >
                  {s.n}
                </p>
                <p className="text-[13px] text-[#9A8C7E]" style={{ fontWeight: 300 }}>
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-8 md:px-14 pb-24">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-20">
            <div style={{ width: 40, height: 2, background: "#1A3C28", marginBottom: 20 }} />
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-[#9A8C7E] uppercase mb-4">
              How it works
            </p>
            <h2
              className="display text-[#1A1A14]"
              style={{
                fontSize: "clamp(32px,5vw,56px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Everything you need,
              <br />
              <em>nothing you don't.</em>
            </h2>
          </div>

          {/* Feature 01 + 02 */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">

            {/* 01 — Balance */}
            <div
              className="card-hover rounded-2xl overflow-hidden flex flex-col min-h-[420px]"
              style={{ background: "#1A3C28", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <span className="feature-num">01</span>
                  <h3
                    className="display text-[#F2EDE6] mt-2 mb-4"
                    style={{
                      fontSize: "clamp(22px,3.5vw,36px)",
                      fontWeight: 700,
                      fontStyle: "italic",
                      lineHeight: 1.15,
                    }}
                  >
                    See exactly where you stand
                  </h3>
                  <p
                    className="text-[15px]"
                    style={{ color: "rgba(242,237,230,0.6)", fontWeight: 300, lineHeight: 1.7 }}
                  >
                    Your balance updates the moment a transaction hits. No delays, no
                    confusion — the real number, always.
                  </p>
                </div>
                {/* Mini balance card */}
                <div
                  className="mt-6 rounded-xl p-5"
                  style={{
                    background: "rgba(242,237,230,0.06)",
                    border: "1px solid rgba(242,237,230,0.1)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "#7DAE93" }}
                  >
                    Main Balance
                  </p>
                  <p className="font-mono text-[30px] font-bold text-[#F2EDE6] tracking-tight">
                    $5,000.00
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-[13px] font-medium text-[#C0C8BF]">James Tester</p>
                      <p
                        className="font-mono text-[11px] mt-0.5"
                        style={{ color: "rgba(242,237,230,0.3)" }}
                      >
                        92182 69064
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-bold tracking-[0.07em] uppercase px-3 py-1 rounded-full"
                      style={{
                        background: "rgba(77,170,112,0.2)",
                        color: "#4DAA70",
                        border: "1px solid rgba(77,170,112,0.3)",
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 — Transactions */}
            <div
              className="card-hover rounded-2xl overflow-hidden flex flex-col min-h-[420px]"
              style={{ background: "#EDEAE3", border: "1px solid rgba(180,160,130,0.2)" }}
            >
              <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <span className="feature-num">02</span>
                  <h3
                    className="display text-[#1A1A14] mt-2 mb-4"
                    style={{
                      fontSize: "clamp(22px,3.5vw,36px)",
                      fontWeight: 700,
                      fontStyle: "italic",
                      lineHeight: 1.15,
                    }}
                  >
                    Every transaction, crystal clear
                  </h3>
                  <p
                    className="text-[15px]"
                    style={{ color: "#6B5F4E", fontWeight: 300, lineHeight: 1.7 }}
                  >
                    Full logs with timestamps, notes, and a running balance after every
                    credit and debit.
                  </p>
                </div>
                <div
                  className="mt-6 rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(180,160,130,0.25)" }}
                >
                  {[
                    { l: "Credit",     t: "Today, 9:41 AM",     a: "+$5,000.00", green: true },
                    { l: "Debit",      t: "Yesterday, 2:15 PM", a: "−$120.00",   green: false },
                    { l: "Withdrawal", t: "Dec 12, 11:02 AM",   a: "−$50.00",    green: false },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom: i < 2 ? "1px solid rgba(180,160,130,0.18)" : "none",
                        background: "rgba(242,237,230,0.7)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm flex-shrink-0"
                        style={{
                          background: tx.green ? "rgba(26,60,40,0.1)" : "rgba(180,160,130,0.2)",
                          color: tx.green ? "#1A3C28" : "#6B5F4E",
                        }}
                      >
                        {tx.green ? "↙" : "↗"}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-[#1A1A14]">{tx.l}</p>
                        <p className="text-[11px] mt-0.5 text-[#9A8C7E]">{tx.t}</p>
                      </div>
                      <p
                        className={`font-mono text-[13px] font-bold ${
                          tx.green ? "text-[#1A3C28]" : "text-[#4A4035]"
                        }`}
                      >
                        {tx.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 03 — Security, full width with image */}
          <div
            className="card-hover rounded-2xl overflow-hidden grid md:grid-cols-2"
            style={{ background: "#EDEAE3", border: "1px solid rgba(180,160,130,0.2)" }}
          >
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="feature-num">03</span>
              <h3
                className="display text-[#1A1A14] mt-2 mb-4"
                style={{
                  fontSize: "clamp(22px,3.5vw,36px)",
                  fontWeight: 700,
                  fontStyle: "italic",
                  lineHeight: 1.15,
                }}
              >
                Security you can
                <br />
                actually feel
              </h3>
              <p
                className="text-[15px] mb-8"
                style={{ color: "#6B5F4E", fontWeight: 300, lineHeight: 1.7 }}
              >
                KYC verification, 256-bit encryption, and real-time fraud monitoring protect
                every account. Verify once — everything unlocks instantly.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: <ShieldCheck className="w-4 h-4" />, label: "256-bit SSL encryption",      sub: "Bank-grade data protection" },
                  { icon: <Zap className="w-4 h-4" />,         label: "KYC verified once",           sub: "Identity check valid forever" },
                  { icon: <BarChart2 className="w-4 h-4" />,   label: "Real-time fraud monitoring",  sub: "Suspicious activity flagged instantly" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{
                      background: "rgba(242,237,230,0.7)",
                      border: "1px solid rgba(180,160,130,0.2)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 text-[#1A3C28]"
                      style={{ background: "rgba(26,60,40,0.1)" }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[#1A1A14]">{item.label}</p>
                      <p className="text-[12px] mt-0.5 text-[#9A8C7E]">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="btn-primary mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold text-[#F2EDE6] self-start"
                style={{ background: "#1A3C28" }}
              >
                Open your account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Real image */}
            <div className="relative min-h-[320px] md:min-h-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80"
                alt="Secure digital banking"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: "rgba(26,60,40,0.15)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="dark-section px-8 md:px-14 py-24 md:py-32">
        <div className="relative max-w-[1100px] mx-auto">
          <div className="mb-14">
            <p
              className="text-[11.5px] font-semibold tracking-[0.12em] uppercase mb-4"
              style={{ color: "rgba(242,237,230,0.35)" }}
            >
              What people say
            </p>
            <h2
              className="display text-[#F2EDE6]"
              style={{
                fontSize: "clamp(32px,5vw,60px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                fontStyle: "italic",
              }}
            >
              Trusted by
              <br />
              thousands.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                q: "Finally a banking app that doesn't feel like it was built in 2008.",
                name: "Sarah K.",
                role: "Freelance designer",
              },
              {
                q: "Verification took 4 minutes. Account was active immediately after.",
                name: "Marcus T.",
                role: "Software engineer",
              },
              {
                q: "The transaction history is exactly what I needed to track my spending.",
                name: "Priya M.",
                role: "Product manager",
              },
            ].map(({ q, name, role }) => (
              <div
                key={name}
                className="card-hover rounded-2xl p-7"
                style={{
                  background: "rgba(242,237,230,0.05)",
                  border: "1px solid rgba(242,237,230,0.08)",
                }}
              >
                <p
                  className="display text-[15px] leading-[1.7] mb-6"
                  style={{
                    color: "rgba(242,237,230,0.75)",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  "{q}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-[#1A3C28]"
                    style={{ background: "#4DAA70" }}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#F2EDE6]">{name}</p>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: "rgba(242,237,230,0.35)" }}
                    >
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-8 md:px-14 py-24 md:py-36">
        <div className="max-w-[1100px] mx-auto text-center">
          <p className="text-[11.5px] font-semibold tracking-[0.12em] text-[#9A8C7E] uppercase mb-6">
            Ready?
          </p>
          <h2
            className="display text-[#1A1A14] mb-8"
            style={{
              fontSize: "clamp(44px,8vw,96px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.03,
            }}
          >
            Open your account
            <br />
            <em style={{ color: "#1A3C28" }}>today.</em>
          </h2>
          <p
            className="text-[17px] text-[#6B5F4E] mb-12 max-w-[400px] mx-auto"
            style={{ fontWeight: 300, lineHeight: 1.7 }}
          >
            Free, fast, and secure. Set up in under two minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="btn-primary px-10 py-4 rounded-full text-[15px] font-semibold text-[#F2EDE6] tracking-wide"
              style={{ background: "#1A3C28" }}
            >
              Create free account →
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 rounded-full text-[15px] font-medium text-[#4A4035] tracking-wide"
              style={{
                border: "1.5px solid rgba(74,64,53,0.25)",
                transition: "border-color 0.2s",
              }}
            >
              Sign in
            </Link>
          </div>
          <p className="mt-6 text-[12.5px] text-[#B0A090]">
            No credit check · No monthly fees · Takes 2 minutes
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-8 md:px-14 py-7 flex items-center justify-between flex-wrap gap-4"
        style={{ borderTop: "1px solid rgba(180,160,130,0.25)" }}
      >
        <NexaLogo />
        <div className="flex gap-7">
          {["Privacy", "Terms", "Security", "Contact"].map((l) => (
            <span
              key={l}
              className="link-ul text-[13px] cursor-pointer"
              style={{ color: "#9A8C7E", fontWeight: 400 }}
            >
              {l}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-[#C0B5A5]">© 2025 NexaBank</p>
      </footer>
    </div>
  );
}

function NexaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
        style={{ background: "#1A3C28" }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1.3" fill="#F2EDE6" />
          <rect x="9" y="2" width="5" height="5" rx="1.3" fill="#F2EDE6" opacity=".35" />
          <rect x="2" y="9" width="5" height="5" rx="1.3" fill="#F2EDE6" opacity=".35" />
          <rect x="9" y="9" width="5" height="5" rx="1.3" fill="#F2EDE6" opacity=".7" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#1A1A14",
        }}
      >
        NexaBank
      </span>
    </div>
  );
}
