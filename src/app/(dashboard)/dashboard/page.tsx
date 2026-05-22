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

// ── Revised palette — lighter, cooler, with colored text ──────────────────
// --bg:        #f0f2f7   page background (cool blue-white)
// --surface:   #e8ecf4   header / nav background
// --card:      #ffffff   card background
// --card-deep: #f4f6fb   inset / nested bg
// --line:      #d4d9e8   borders
// --line-soft: #e0e4f0   subtle dividers
// --indigo:    #3d52a0   primary accent (bank name, active states)
// --indigo-lt: #6b7fd4   lighter indigo
// --indigo-dk: #2a3a78   darker indigo / section links
// --text-pri:  #1a1f3a   headings / primary text (deep navy)
// --text-sec:  #3d4870   secondary text (indigo-tinted)
// --text-dim:  #7b87b8   placeholder / dim labels
// --teal:      #0f7a6e   credit / active green-teal
// --rose:      #b52b3a   debit red
// --amber:     #c47a00   currency / unverified

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; sign: string; border: string;
}> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, bg: "bg-[#edf7f5]", border: "border-[#a8dbd4]", text: "text-[#0f7a6e]", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  bg: "bg-[#faeef0]", border: "border-[#e8b8be]", text: "text-[#b52b3a]", sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  bg: "bg-[#faeef0]", border: "border-[#e8b8be]", text: "text-[#b52b3a]", sign: "−" },
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

  const fmtAcctNum = (n: string) =>
    `${n.slice(0, 5)}  ${n.slice(5)}`;

  return (
    <div className="min-h-screen bg-[#f0f2f7] font-sans">

      {/* ── Page header ─────────────────────────────── */}
      <div className="flex items-start justify-between px-5 pt-12 pb-5 border-b border-[#d4d9e8] bg-[#e8ecf4]">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#3d52a0]"
             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            NexaBank
          </p>
          <h1 className="text-[22px] font-semibold text-[#1a1f3a] tracking-tight mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Account Overview
          </h1>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {/* Bell */}
          <div className="w-9 h-9 rounded-full bg-[#f0f2f7] border border-[#d4d9e8] flex items-center justify-center shadow-sm">
            <Bell className="w-4 h-4 text-[#3d4870]" strokeWidth={1.5} />
          </div>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#2a3a78] shadow-sm"
               style={{ background: "linear-gradient(135deg, #2a3a78, #6b7fd4)" }}>
            <span className="text-[13px] font-semibold text-white tracking-wide">{initials}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 pb-24 flex flex-col gap-4 max-w-lg mx-auto lg:max-w-none lg:grid lg:grid-cols-3 lg:gap-5 lg:px-8">

        {/* ══ COLUMN 1 ══════════════════════════════════ */}
        <div className="flex flex-col gap-3">

          {/* ── KYC banner ── */}
          {!isVerified && (
            <Link
              href="/kyc"
              className="flex items-center gap-3 bg-[#fff8ec] border border-[#f0d9a0] rounded-2xl p-4 hover:bg-[#fff3dc] transition-all active:scale-[0.99]"
            >
              <div className="w-10 h-10 bg-[#f5ead0] border border-[#e8cc88] rounded-[13px] flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4.5 h-4.5 text-[#c47a00]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1a1f3a] leading-snug">Verify your identity</p>
                <p className="text-[11px] text-[#7a5c00] mt-0.5 leading-relaxed">
                  Complete KYC to unlock transfers and get your account number.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#c47a00] flex-shrink-0" />
            </Link>
          )}

          {/* ── Balance card ── */}
          <div className="relative rounded-[14px] p-6 overflow-hidden border border-[#d4d9e8] shadow-sm bg-white">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#7b87b8] mb-2">
              Main Balance
            </p>
            <p className="font-mono text-[34px] font-semibold text-[#1a1f3a] leading-none tracking-tight mb-5">
              {formatMoney(account.balance, account.currency)}
            </p>

            <div className="h-px bg-[#e0e4f0] mb-4" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#1a1f3a] leading-none"
                   style={{ fontFamily: "'Playfair Display', serif" }}>
                  {session.user.name}
                </p>
                <p className="font-mono text-[11px] text-[#7b87b8] tracking-[0.15em] mt-1.5">
                  {isVerified && account.accountNumber
                    ? fmtAcctNum(account.accountNumber)
                    : "— Pending KYC —"}
                </p>
              </div>
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-[#edf7f5] border border-[#a8dbd4] px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f7a6e]" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#0f7a6e]">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#fff8ec] border border-[#f0d9a0] px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c47a00]" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#c47a00]">Unverified</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div className="grid grid-cols-4 gap-2.5">

            {/* Send */}
            {isVerified ? (
              <Link
                href="/withdraw"
                className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#d4d9e8] shadow-sm hover:border-[#6b7fd4] transition-all active:scale-[0.97]"
              >
                <div className="w-9 h-9 rounded-full bg-[#eef0f9] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#3d52a0]" strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#3d4870]">Send</span>
              </Link>
            ) : (
              <span className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#d4d9e8] shadow-sm cursor-not-allowed opacity-40 select-none">
                <div className="w-9 h-9 rounded-full bg-[#eef0f9] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#3d52a0]" strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#3d4870]">Send</span>
              </span>
            )}

            {/* Receive */}
            <ReceiveSheet
              name={session.user.name}
              accountNumber={isVerified && account.accountNumber ? fmtAcctNum(account.accountNumber) : null}
              sortCode="20 — 14 — 53"
              currency={account.currency}
              isVerified={isVerified}
            />

            {/* History */}
            <Link
              href="/transactions"
              className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#d4d9e8] shadow-sm hover:border-[#6b7fd4] transition-all active:scale-[0.97]"
            >
              <div className="w-9 h-9 rounded-full bg-[#f0f2f7] flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-[#6b7fd4]" strokeWidth={1.8} />
              </div>
              <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#3d4870]">History</span>
            </Link>

            {/* More */}
            <MoreSheet />

          </div>

          {/* ── Account details ── */}
          <div className="bg-white rounded-2xl border border-[#d4d9e8] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-[#1a1f3a]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Account Details
              </p>
            </div>

            {/* Account number */}
            <div className="bg-[#f4f6fb] rounded-[12px] px-4 py-3 mb-3">
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#7b87b8] mb-1.5">
                Account Number
              </p>
              {isVerified && account.accountNumber ? (
                <p className="font-mono text-[16px] font-semibold text-[#1a1f3a] tracking-[0.1em]">
                  {fmtAcctNum(account.accountNumber)}
                </p>
              ) : (
                <p className="font-mono text-[13px] text-[#7b87b8]">— Pending KYC —</p>
              )}
            </div>

            {/* Account type row */}
            <div className="flex items-center justify-between px-1 mb-3">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[#7b87b8] mb-1">Account Type</p>
                <p className="font-mono text-[13px] text-[#1a1f3a] font-medium">Current Account</p>
              </div>
              <span className="text-[10px] text-[#7b87b8]">Personal</span>
            </div>

            {/* Pills */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#eef0f9] border border-[#c4cce8] rounded-lg px-3 py-1.5">
                <Wallet className="w-3 h-3 text-[#3d52a0]" />
                <span className="text-[11px] font-bold text-[#3d52a0] tracking-[0.06em]">{account.currency}</span>
              </div>
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-[#edf7f5] border border-[#a8dbd4] rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f7a6e]" />
                  <span className="text-[11px] font-bold text-[#0f7a6e]">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#fff8ec] border border-[#f0d9a0] rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c47a00]" />
                  <span className="text-[11px] font-bold text-[#c47a00]">Unverified</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ══ COLUMN 2 ══════════════════════════════════ */}
        <div className="flex flex-col gap-3">

          {/* ── Transaction summary ── */}
          <Link
            href="/transactions"
            className="bg-white rounded-2xl border border-[#d4d9e8] shadow-sm p-5 flex items-center justify-between hover:border-[#6b7fd4] hover:shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#edf7f5] border border-[#a8dbd4] rounded-[14px] flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-[#0f7a6e]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1a1f3a]">Transaction Summary</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#3d4870]">
                    In:{" "}
                    <span className="font-mono font-bold text-[#0f7a6e]">
                      {formatMoney(totalCredited, account.currency)}
                    </span>
                  </span>
                  <span className="text-[#d4d9e8]">·</span>
                  <span className="text-[11px] text-[#3d4870]">
                    Out:{" "}
                    <span className="font-mono font-bold text-[#b52b3a]">
                      {formatMoney(totalDebited, account.currency)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#d4d9e8] group-hover:text-[#3d52a0] transition-colors flex-shrink-0" />
          </Link>

          {/* ── Spending overview ── */}
          <div className="bg-white rounded-2xl border border-[#d4d9e8] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e4f0]">
              <p className="text-[13px] font-semibold text-[#1a1f3a]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Spending Overview
              </p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#2a3a78]">
                Details →
              </Link>
            </div>
            <div className="flex items-center gap-5 p-5">
              {/* Donut */}
              <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
                <circle cx="45" cy="45" r="32" fill="none" stroke="#e0e4f0" strokeWidth="12" />
                {totalCredited > 0 && (
                  <circle cx="45" cy="45" r="32" fill="none" stroke="#0f7a6e" strokeWidth="12"
                    strokeDasharray={`${creditPct} ${circumference - creditPct}`}
                    strokeDashoffset="0" strokeLinecap="butt"
                    transform="rotate(-90 45 45)"
                  />
                )}
                {totalDebited > 0 && (
                  <circle cx="45" cy="45" r="32" fill="none" stroke="#6b7fd4" strokeWidth="12"
                    strokeDasharray={`${debitPct} ${circumference - debitPct}`}
                    strokeDashoffset={`-${creditPct}`} strokeLinecap="butt"
                    transform="rotate(-90 45 45)"
                  />
                )}
                <text x="45" y="41" textAnchor="middle" fontSize="9" fontFamily="monospace"
                      fontWeight="700" fill="#1a1f3a">
                  {formatMoney(account.balance, account.currency).replace(/\.00$/, "")}
                </text>
                <text x="45" y="52" textAnchor="middle" fontSize="8" fill="#7b87b8">balance</text>
              </svg>

              {/* Legend */}
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { color: "#0f7a6e", label: "Credits", val: totalCredited },
                  { color: "#6b7fd4", label: "Debits",  val: totalDebited  },
                ].map(({ color, label, val }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[11px] text-[#3d4870] font-medium flex-1 tracking-[0.03em]">{label}</span>
                    <span className="font-mono text-[12px] font-semibold text-[#1a1f3a]">
                      {formatMoney(val, account.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent activity (mobile / col-2 on desktop) ── */}
          <div className="bg-white rounded-2xl border border-[#d4d9e8] shadow-sm overflow-hidden lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e4f0]">
              <p className="text-[13px] font-semibold text-[#1a1f3a]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Recent Transactions
              </p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#2a3a78]">
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <CreditCard className="w-7 h-7 text-[#d4d9e8] mb-3" />
                <p className="text-[12px] font-semibold text-[#7b87b8]">No transactions yet</p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 4).map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id}
                         className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0f2f7] last:border-0 hover:bg-[#f4f6fb] transition-colors">
                      <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1a1f3a]">{cfg.label}</p>
                        <p className="text-[10px] text-[#7b87b8] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-[13px] font-bold font-mono",
                          tx.type === "CREDIT" ? "text-[#0f7a6e]" : "text-[#b52b3a]")}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#7b87b8] tracking-[0.1em] uppercase mt-0.5">Cleared</p>
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
          <div className="bg-white rounded-2xl border border-[#d4d9e8] shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0e4f0]">
              <p className="text-[13px] font-semibold text-[#1a1f3a]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Recent Transactions
              </p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#2a3a78]">
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <CreditCard className="w-7 h-7 text-[#d4d9e8] mb-3" />
                <p className="text-[12px] font-semibold text-[#7b87b8]">No transactions yet</p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 6).map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id}
                         className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f0f2f7] last:border-0 hover:bg-[#f4f6fb] transition-colors">
                      <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1a1f3a]">
                          {tx.note ?? cfg.label}
                        </p>
                        <p className="text-[10px] text-[#7b87b8] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-[13px] font-bold font-mono",
                          tx.type === "CREDIT" ? "text-[#0f7a6e]" : "text-[#b52b3a]")}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#7b87b8] tracking-[0.1em] uppercase mt-0.5">Cleared</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Full-width transactions table (desktop only) ── */}
      {account.transactions.length > 0 && (
        <div className="hidden lg:block bg-white rounded-2xl border border-[#d4d9e8] shadow-sm overflow-hidden mx-8 mb-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e4f0]">
            <p className="text-[14px] font-semibold text-[#1a1f3a]"
               style={{ fontFamily: "'Playfair Display', serif" }}>
              All Recent Transactions
            </p>
            <Link href="/transactions"
                  className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#2a3a78]">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#f0f2f7]">
            {account.transactions.map((tx) => {
              const cfg  = TX_CONFIG[tx.type];
              const Icon = cfg.icon;
              return (
                <div key={tx.id}
                     className="flex items-center gap-4 px-6 py-4 hover:bg-[#f4f6fb] transition-colors">
                  <div className={cn("w-10 h-10 rounded-[13px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                    <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1a1f3a]">
                      {tx.note ?? cfg.label}
                    </p>
                    <p className="text-[11px] text-[#7b87b8] font-mono tracking-[0.03em] mt-0.5">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[9px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full bg-[#f0f2f7] text-[#7b87b8] border border-[#d4d9e8]">
                      Cleared
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn("text-[14px] font-bold font-mono",
                      tx.type === "CREDIT" ? "text-[#0f7a6e]" : "text-[#b52b3a]")}>
                      {cfg.sign}{formatMoney(tx.amount, account.currency)}
                    </p>
                    <p className="text-[10px] text-[#7b87b8] font-mono mt-0.5">
                      Bal: {formatMoney(tx.balanceAfter, account.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom nav (mobile) ─────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#e8ecf4] border-t border-[#d4d9e8] shadow-[0_-4px_16px_rgba(40,50,120,0.08)]">
        <div className="grid grid-cols-5 pb-safe">
          {[
            { label: "Overview",  icon: Home,         href: "/dashboard",    active: true  },
            { label: "Accounts",  icon: LayoutGrid,   href: "/accounts",     active: false },
            { label: "Transfer",  icon: ArrowUpRight, href: isVerified ? "/send" : null, active: false },
            { label: "Analytics", icon: BarChart2,    href: "/transactions", active: false },
            { label: "Profile",   icon: User,         href: "/profile",      active: false },
          ].map(({ label, icon: Icon, href, active }) => {
            const cls = `flex flex-col items-center gap-1 py-3 px-1 transition-colors ${
              active ? "text-[#3d52a0]" : "text-[#7b87b8] hover:text-[#3d4870]"
            }`;
            const inner = (
              <>
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase">{label}</span>
              </>
            );
            return href ? (
              <Link key={label} href={href} className={cls}>{inner}</Link>
            ) : (
              <span key={label} className={`${cls} opacity-40 cursor-not-allowed`}>{inner}</span>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
