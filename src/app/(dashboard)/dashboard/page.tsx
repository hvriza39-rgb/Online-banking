// ╔══════════════════════════════════════════════════════╗
// ║  PATH: src/app/dashboard/page.tsx                   ║
// ╚══════════════════════════════════════════════════════╝

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  ArrowDownLeft, ArrowUpRight, ShieldAlert, ArrowRight,
  Wallet, BarChart2, Bell, Send, ClipboardList,
  MoreHorizontal, CreditCard, Home, LayoutGrid, User,
} from "lucide-react";
import ReceiveSheet from "./ReceiveSheet";
import MoreSheet from "./MoreSheet";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = { title: "Account Overview — NexaBank" };

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; sign: string; border: string;
}> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, bg: "bg-[#f0fdf9]", border: "border-[#bbf7e0]", text: "text-[#0d9488]", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  bg: "bg-[#fff5f5]", border: "border-[#fecaca]", text: "text-[#dc2626]", sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  bg: "bg-[#fff5f5]", border: "border-[#fecaca]", text: "text-[#dc2626]", sign: "−" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true },
  });

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 8 } },
  });

  if (!account) redirect("/login");

  const isVerified = user?.kycStatus === "VERIFIED";

  const totalCredited = account.transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const totalDebited = account.transactions
    .filter((t) => t.type !== "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const total = totalCredited + totalDebited || 1;
  const circumference = 251.2;
  const creditPct = (totalCredited / total) * circumference;
  const debitPct  = (totalDebited  / total) * circumference;

  const initials = session.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fmtAcctNum = (n: string) => `${n.slice(0, 5)}  ${n.slice(5)}`;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        .nexa-body { font-family: 'IBM Plex Sans', sans-serif; }
        .nexa-display { font-family: 'Playfair Display', serif; }
        .nexa-mono { font-family: 'IBM Plex Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-1 { animation: fadeUp 0.45s ease 0.05s both; }
        .anim-2 { animation: fadeUp 0.45s ease 0.12s both; }
        .anim-3 { animation: fadeUp 0.45s ease 0.19s both; }
        .anim-4 { animation: fadeUp 0.45s ease 0.26s both; }
        .anim-5 { animation: fadeUp 0.45s ease 0.33s both; }
        .anim-6 { animation: fadeUp 0.45s ease 0.40s both; }
        .anim-header { animation: fadeIn 0.35s ease 0.0s both; }

        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(80,50,10,0.14); }
        .action-btn:active { transform: translateY(0); }
        .txn-row:hover { background: rgba(245,246,248,0.8); }
        .balance-card-shine::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%);
          border-radius: inherit;
          pointer-events: none;
        }
      `}</style>

      <div className="nexa-body min-h-screen" style={{ background: "#eee8db" }}>

        {/* ── Header ──────────────────────────────────── */}
        <div className="anim-header flex items-start justify-between px-5 pt-12 pb-5 border-b"
             style={{ background: "#e5ddd0", borderColor: "#c8bea8" }}>
          <div>
            <p className="nexa-display text-[12px] tracking-[0.22em] uppercase font-medium"
               style={{ color: "#8a6e28" }}>
              NexaBank
            </p>
            <h1 className="nexa-display text-[23px] font-[400] mt-0.5 tracking-[0.01em]"
                style={{ color: "#1c1408" }}>
              Account Overview
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "rgba(0,0,0,0.05)", border: "1px solid #c8bea8" }}>
              <Bell className="w-4 h-4" style={{ stroke: "#5c4c30" }} strokeWidth={1.5} />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center select-none"
                 style={{ background: "linear-gradient(135deg, #6a5018, #b89448)", border: "2px solid #8a6e28", boxShadow: "0 2px 8px rgba(106,80,24,0.35)" }}>
              <span className="nexa-display text-[13px] font-[600]" style={{ color: "#f5ead0" }}>{initials}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-28 flex flex-col gap-3 max-w-lg mx-auto lg:max-w-none lg:grid lg:grid-cols-3 lg:gap-4 lg:px-8 lg:pb-10">

          {/* ══ COLUMN 1 ══════════════════════════════════ */}
          <div className="flex flex-col gap-3">

            {/* ── KYC banner ── */}
            {!isVerified && (
              <Link href="/kyc" className="anim-1 flex items-center gap-3 rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg, #fef9ec, #fef3d0)", border: "1px solid #e8c84a55" }}>
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0"
                     style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)" }}>
                  <ShieldAlert className="w-4 h-4" style={{ color: "#b45309" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-[600] leading-snug" style={{ color: "#78350f" }}>Verify your identity</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "#92400e" }}>
                    Complete KYC to unlock transfers and get your account number.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: "#b45309" }} />
              </Link>
            )}

            {/* ── Balance card ── */}
            <div className={`anim-${isVerified ? "1" : "2"} balance-card-shine relative rounded-[18px] p-6 overflow-hidden`}
                 style={{ background: "linear-gradient(145deg, #f5edd8 0%, #ede0c4 50%, #e5d6b0 100%)", border: "1px solid #c8b890", boxShadow: "0 4px 20px rgba(80,50,10,0.18), inset 0 1px 0 rgba(255,255,255,0.6)" }}>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
                   style={{ background: "radial-gradient(circle, rgba(184,148,72,0.2) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
                   style={{ background: "linear-gradient(90deg, transparent, rgba(138,110,40,0.5), transparent)" }} />

              <div className="relative">
                <p className="nexa-mono text-[9px] font-[500] tracking-[0.22em] uppercase mb-2" style={{ color: "#9a7a40" }}>
                  Main Balance
                </p>
                <p className="nexa-mono text-[36px] font-[600] leading-none tracking-tight mb-5" style={{ color: "#1c1408" }}>
                  {formatMoney(account.balance, account.currency)}
                </p>

                <div className="h-px mb-4" style={{ background: "linear-gradient(90deg, transparent, #c8b890, transparent)" }} />

                <div className="flex items-end justify-between">
                  <div>
                    <p className="nexa-display text-[14px] font-[500] leading-none" style={{ color: "#1c1408" }}>
                      {session.user.name}
                    </p>
                    <p className="nexa-mono text-[11px] tracking-[0.18em] mt-1.5" style={{ color: "#9a8a68" }}>
                      {isVerified && account.accountNumber ? fmtAcctNum(account.accountNumber) : "— Pending KYC —"}
                    </p>
                  </div>
                  {isVerified ? (
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                         style={{ background: "rgba(42,122,88,0.12)", border: "1px solid rgba(42,122,88,0.3)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2a7a58", boxShadow: "0 0 5px rgba(42,122,88,0.6)" }} />
                      <span className="nexa-mono text-[9px] font-[600] tracking-[0.15em] uppercase" style={{ color: "#2a7a58" }}>Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                         style={{ background: "rgba(180,83,9,0.1)", border: "1px solid rgba(180,83,9,0.25)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#b45309" }} />
                      <span className="nexa-mono text-[9px] font-[600] tracking-[0.15em] uppercase" style={{ color: "#b45309" }}>Unverified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Quick actions ── */}
            <div className="anim-3 grid grid-cols-4 gap-2">
              {isVerified ? (
                <Link href="/withdraw" className="action-btn flex flex-col items-center gap-2 py-3 px-1 rounded-[14px] transition-all cursor-pointer"
                      style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 8px rgba(80,50,10,0.1)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                       style={{ background: "rgba(28,20,8,0.08)" }}>
                    <Send className="w-4 h-4" style={{ stroke: "#1c1408" }} strokeWidth={1.8} />
                  </div>
                  <span className="nexa-mono text-[9px] font-[500] tracking-[0.1em] uppercase" style={{ color: "#5c4c30" }}>Send</span>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3 px-1 rounded-[14px] opacity-40 cursor-not-allowed"
                     style={{ background: "#f2ece0", border: "1px solid #c8bea8" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(28,20,8,0.08)" }}>
                    <Send className="w-4 h-4" style={{ stroke: "#1c1408" }} strokeWidth={1.8} />
                  </div>
                  <span className="nexa-mono text-[9px] font-[500] tracking-[0.1em] uppercase" style={{ color: "#5c4c30" }}>Send</span>
                </div>
              )}

              <ReceiveSheet
                name={session.user.name}
                accountNumber={isVerified && account.accountNumber ? fmtAcctNum(account.accountNumber) : null}
                sortCode="20 — 14 — 53"
                currency={account.currency}
                isVerified={isVerified}
              />

              <Link href="/transactions" className="action-btn flex flex-col items-center gap-2 py-3 px-1 rounded-[14px] transition-all"
                    style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 8px rgba(80,50,10,0.1)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(138,144,136,0.15)" }}>
                  <ClipboardList className="w-4 h-4" style={{ stroke: "#586058" }} strokeWidth={1.8} />
                </div>
                <span className="nexa-mono text-[9px] font-[500] tracking-[0.1em] uppercase" style={{ color: "#5c4c30" }}>History</span>
              </Link>

              <MoreSheet />
            </div>

            {/* ── Account details ── */}
            <div className="anim-4 rounded-[18px] overflow-hidden"
                 style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 10px rgba(80,50,10,0.1)" }}>
              <div className="flex items-center justify-between px-5 py-4"
                   style={{ borderBottom: "1px solid #d8d0bc" }}>
                <p className="nexa-display text-[14px] font-[500]" style={{ color: "#1c1408" }}>Account Details</p>
                <span className="nexa-mono text-[10px] tracking-[0.1em] uppercase cursor-pointer" style={{ color: "#8a9088" }}>Manage →</span>
              </div>

              {/* Account number */}
              <div className="px-5 pt-4 pb-3">
                <div className="rounded-[12px] px-4 py-3 mb-3" style={{ background: "#e8e0d0", border: "1px solid #d0c8b4" }}>
                  <p className="nexa-mono text-[9px] font-[500] tracking-[0.2em] uppercase mb-1.5" style={{ color: "#9a8a68" }}>Account Number</p>
                  {isVerified && account.accountNumber ? (
                    <p className="nexa-mono text-[16px] font-[600] tracking-[0.12em]" style={{ color: "#1c1408" }}>
                      {fmtAcctNum(account.accountNumber)}
                    </p>
                  ) : (
                    <p className="nexa-mono text-[13px]" style={{ color: "#9a8a68" }}>— Pending KYC —</p>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 mb-4">
                  <div>
                    <p className="nexa-mono text-[9px] font-[500] tracking-[0.15em] uppercase mb-1" style={{ color: "#9a8a68" }}>Account Type</p>
                    <p className="nexa-mono text-[13px] font-[500]" style={{ color: "#1c1408" }}>Current Account</p>
                  </div>
                  <span className="text-[11px]" style={{ color: "#9a8a68" }}>Personal</span>
                </div>

                <div className="flex items-center gap-2 pb-4">
                  <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                       style={{ background: "rgba(138,110,40,0.12)", border: "1px solid rgba(138,110,40,0.28)" }}>
                    <Wallet className="w-3 h-3" style={{ stroke: "#6a5018" }} />
                    <span className="nexa-mono text-[11px] font-[600] tracking-[0.08em]" style={{ color: "#6a5018" }}>{account.currency}</span>
                  </div>
                  {isVerified ? (
                    <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                         style={{ background: "rgba(42,122,88,0.1)", border: "1px solid rgba(42,122,88,0.28)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2a7a58" }} />
                      <span className="nexa-mono text-[11px] font-[600]" style={{ color: "#2a7a58" }}>Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                         style={{ background: "rgba(180,83,9,0.1)", border: "1px solid rgba(180,83,9,0.25)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#b45309" }} />
                      <span className="nexa-mono text-[11px] font-[600]" style={{ color: "#b45309" }}>Unverified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ══ COLUMN 2 ══════════════════════════════════ */}
          <div className="flex flex-col gap-3">

            {/* ── Transaction summary ── */}
            <Link href="/transactions"
                  className="anim-3 group flex items-center justify-between rounded-[18px] p-5 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 10px rgba(80,50,10,0.1)" }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                     style={{ background: "rgba(42,122,88,0.12)", border: "1px solid rgba(42,122,88,0.28)" }}>
                  <BarChart2 className="w-5 h-5" style={{ stroke: "#2a7a58" }} />
                </div>
                <div>
                  <p className="nexa-display text-[14px] font-[500]" style={{ color: "#1c1408" }}>Transaction Summary</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="nexa-mono text-[11px]" style={{ color: "#9a8a68" }}>
                      In: <span className="font-[600]" style={{ color: "#2a7a58" }}>{formatMoney(totalCredited, account.currency)}</span>
                    </span>
                    <span style={{ color: "#d8d0bc" }}>·</span>
                    <span className="nexa-mono text-[11px]" style={{ color: "#9a8a68" }}>
                      Out: <span className="font-[600]" style={{ color: "#1c1408" }}>{formatMoney(totalDebited, account.currency)}</span>
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ stroke: "#c8bea8" }} />
            </Link>

            {/* ── Spending overview ── */}
            <div className="anim-4 rounded-[18px] overflow-hidden"
                 style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 10px rgba(80,50,10,0.1)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #d8d0bc" }}>
                <p className="nexa-display text-[14px] font-[500]" style={{ color: "#1c1408" }}>Spending Overview</p>
                <Link href="/transactions" className="nexa-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: "#586058" }}>Details →</Link>
              </div>
              <div className="flex items-center gap-6 p-5">
                {/* Donut */}
                <div className="relative flex-shrink-0">
                  <svg width="88" height="88" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r="32" fill="none" stroke="#d8d0bc" strokeWidth="11" />
                    {totalCredited > 0 && (
                      <circle cx="44" cy="44" r="32" fill="none" stroke="#2a7a58" strokeWidth="11"
                        strokeDasharray={`${creditPct} ${circumference - creditPct}`}
                        strokeDashoffset="0" strokeLinecap="butt"
                        transform="rotate(-90 44 44)"
                        style={{ filter: "drop-shadow(0 0 3px rgba(42,122,88,0.4))" }}
                      />
                    )}
                    {totalDebited > 0 && (
                      <circle cx="44" cy="44" r="32" fill="none" stroke="#8a9088" strokeWidth="11"
                        strokeDasharray={`${debitPct} ${circumference - debitPct}`}
                        strokeDashoffset={`-${creditPct}`} strokeLinecap="butt"
                        transform="rotate(-90 44 44)"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="nexa-mono text-[10px] font-[600]" style={{ color: "#1c1408" }}>
                      {formatMoney(account.balance, account.currency).replace(/\.00$/, "")}
                    </span>
                    <span className="nexa-mono text-[8px] mt-0.5" style={{ color: "#9a8a68" }}>balance</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-4 flex-1">
                  {[
                    { color: "#2a7a58", label: "Credits", val: totalCredited },
                    { color: "#8a9088", label: "Debits",  val: totalDebited  },
                  ].map(({ color, label, val }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[12px] font-[500] flex-1" style={{ color: "#5c4c30" }}>{label}</span>
                      <span className="nexa-mono text-[12px] font-[600]" style={{ color: "#1c1408" }}>
                        {formatMoney(val, account.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Recent transactions (mobile / col-2 desktop) ── */}
            <div className="anim-5 rounded-[18px] overflow-hidden lg:hidden"
                 style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 10px rgba(80,50,10,0.1)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #d8d0bc" }}>
                <p className="nexa-display text-[14px] font-[500]" style={{ color: "#1c1408" }}>Recent Transactions</p>
                <Link href="/transactions" className="nexa-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: "#586058" }}>See all →</Link>
              </div>
              {account.transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                  <CreditCard className="w-7 h-7 mb-3" style={{ stroke: "#d8d0bc" }} />
                  <p className="nexa-mono text-[12px] font-[500]" style={{ color: "#9a8a68" }}>No transactions yet</p>
                </div>
              ) : (
                <div>
                  {account.transactions.slice(0, 4).map((tx) => {
                    const cfg = TX_CONFIG[tx.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={tx.id} className="txn-row flex items-center gap-3 px-5 py-3.5 transition-colors"
                           style={{ borderBottom: "1px solid #e0d8c8" }}>
                        <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                          <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-[600]" style={{ color: "#1c1408" }}>{cfg.label}</p>
                          <p className="nexa-mono text-[10px] tracking-[0.04em] mt-0.5" style={{ color: "#9a8a68" }}>
                            {formatDateTime(tx.createdAt)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn("nexa-mono text-[13px] font-[600]", tx.type === "CREDIT" ? "text-[#2a7a58]" : "text-[#5c4c30]")}>
                            {cfg.sign}{formatMoney(tx.amount, account.currency)}
                          </p>
                          <p className="nexa-mono text-[9px] tracking-[0.1em] uppercase mt-0.5" style={{ color: "#9a8a68" }}>Cleared</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ══ COLUMN 3 — desktop only ════════════════════ */}
          <div className="hidden lg:flex flex-col gap-3">
            <div className="anim-4 rounded-[18px] overflow-hidden flex-1"
                 style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 10px rgba(80,50,10,0.1)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #d8d0bc" }}>
                <p className="nexa-display text-[14px] font-[500]" style={{ color: "#1c1408" }}>Recent Transactions</p>
                <Link href="/transactions" className="nexa-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: "#586058" }}>See all →</Link>
              </div>
              {account.transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                  <CreditCard className="w-7 h-7 mb-3" style={{ stroke: "#d8d0bc" }} />
                  <p className="nexa-mono text-[12px] font-[500]" style={{ color: "#9a8a68" }}>No transactions yet</p>
                </div>
              ) : (
                <div>
                  {account.transactions.slice(0, 6).map((tx) => {
                    const cfg = TX_CONFIG[tx.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={tx.id} className="txn-row flex items-center gap-3 px-5 py-3.5 transition-colors"
                           style={{ borderBottom: "1px solid #e0d8c8" }}>
                        <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                          <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-[600]" style={{ color: "#1c1408" }}>
                            {tx.note ?? cfg.label}
                          </p>
                          <p className="nexa-mono text-[10px] tracking-[0.04em] mt-0.5" style={{ color: "#9a8a68" }}>
                            {formatDateTime(tx.createdAt)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn("nexa-mono text-[13px] font-[600]", tx.type === "CREDIT" ? "text-[#2a7a58]" : "text-[#5c4c30]")}>
                            {cfg.sign}{formatMoney(tx.amount, account.currency)}
                          </p>
                          <p className="nexa-mono text-[9px] tracking-[0.1em] uppercase mt-0.5" style={{ color: "#9a8a68" }}>Cleared</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Desktop full-width transaction table ── */}
        {account.transactions.length > 0 && (
          <div className="hidden lg:block rounded-[18px] overflow-hidden mx-8 mb-10"
               style={{ background: "#f2ece0", border: "1px solid #c8bea8", boxShadow: "0 2px 10px rgba(80,50,10,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #d8d0bc" }}>
              <p className="nexa-display text-[15px] font-[500]" style={{ color: "#1c1408" }}>All Recent Transactions</p>
              <Link href="/transactions" className="nexa-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: "#586058" }}>View all →</Link>
            </div>
            <div>
              {account.transactions.map((tx) => {
                const cfg = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="txn-row flex items-center gap-4 px-6 py-4 transition-colors"
                       style={{ borderBottom: "1px solid #e0d8c8" }}>
                    <div className={cn("w-10 h-10 rounded-[13px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                      <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-[600]" style={{ color: "#1c1408" }}>{tx.note ?? cfg.label}</p>
                      <p className="nexa-mono text-[11px] tracking-[0.03em] mt-0.5" style={{ color: "#9a8a68" }}>
                        {formatDateTime(tx.createdAt)}
                      </p>
                    </div>
                    <span className="nexa-mono text-[9px] font-[600] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full hidden sm:block"
                          style={{ background: "#e8e0d0", color: "#9a8a68", border: "1px solid #d8d0bc" }}>
                      Cleared
                    </span>
                    <div className="text-right flex-shrink-0">
                      <p className={cn("nexa-mono text-[14px] font-[600]", tx.type === "CREDIT" ? "text-[#2a7a58]" : "text-[#5c4c30]")}>
                        {cfg.sign}{formatMoney(tx.amount, account.currency)}
                      </p>
                      <p className="nexa-mono text-[10px] mt-0.5" style={{ color: "#9a8a68" }}>
                        Bal: {formatMoney(tx.balanceAfter, account.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bottom nav ──────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30"
             style={{ background: "#e5ddd0", borderTop: "1px solid #c8bea8", boxShadow: "0 -4px 20px rgba(80,50,10,0.15)" }}>
          <div className="grid grid-cols-5 pb-safe">
            {[
              { label: "Overview",  icon: Home,         href: "/dashboard",                        active: true  },
              { label: "Accounts",  icon: LayoutGrid,   href: "/accounts",                         active: false },
              { label: "Transfer",  icon: ArrowUpRight, href: isVerified ? "/send" : null,         active: false },
              { label: "Analytics", icon: BarChart2,    href: "/transactions",                     active: false },
              { label: "Profile",   icon: User,         href: "/profile",                          active: false },
            ].map(({ label, icon: Icon, href, active }) => {
              const inner = (
                <>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  <span className="nexa-mono text-[9px] font-[500] tracking-[0.08em] uppercase">{label}</span>
                </>
              );
              const activeStyle = { color: "#2a7a58" };
              const inactiveStyle = { color: "#9a8a68" };
              const cls = "flex flex-col items-center gap-1 py-3 px-1 transition-colors";
              return href ? (
                <Link key={label} href={href} className={cls} style={active ? activeStyle : inactiveStyle}>{inner}</Link>
              ) : (
                <span key={label} className={`${cls} opacity-40 cursor-not-allowed`} style={inactiveStyle}>{inner}</span>
              );
            })}
          </div>
        </nav>

      </div>
    </>
  );
}
