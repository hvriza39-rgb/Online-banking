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

// ── Parchment palette ──────────────────────────────────────────────────────
// --bg:        #e8e0d0   page background
// --surface:   #ddd5c3   header / nav background
// --card:      #f2ece0   card background
// --card-deep: #e8e0d0   inset / nested bg
// --line:      #c8bea8   borders
// --line-soft: #d8d0bc   subtle dividers
// --gold:      #8a6e28   primary accent (bank name, currency chip, active nav)
// --gold-lt:   #b89448   lighter gold
// --gold-dk:   #6a5018   darker gold / section links
// --silver:    #8a9088   secondary icon tint
// --silver-dk: #586058   muted icon / label tint
// --text-pri:  #1c1408   headings / primary text
// --text-sec:  #5c4c30   secondary text
// --text-dim:  #9a8a68   placeholder / dim labels
// --sage:      #2a7a58   credit / active green
// --rust:      #a02010   debit red

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; sign: string; border: string;
}> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, bg: "bg-[#eef6f1]", border: "border-[#b8d8c8]", text: "text-[#2a7a58]", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  bg: "bg-[#f9efed]", border: "border-[#e8c0b8]", text: "text-[#a02010]", sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  bg: "bg-[#f9efed]", border: "border-[#e8c0b8]", text: "text-[#a02010]", sign: "−" },
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
    <div className="min-h-screen bg-[#e8e0d0] font-sans">

      {/* ── Page header ─────────────────────────────── */}
      <div className="flex items-start justify-between px-5 pt-12 pb-5 border-b border-[#c8bea8] bg-[#ddd5c3]">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8a6e28]"
             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            NexaBank
          </p>
          <h1 className="text-[22px] font-semibold text-[#1c1408] tracking-tight mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Account Overview
          </h1>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {/* Bell */}
          <div className="w-9 h-9 rounded-full bg-[#e8e0d0] border border-[#c8bea8] flex items-center justify-center shadow-sm">
            <Bell className="w-4 h-4 text-[#5c4c30]" strokeWidth={1.5} />
          </div>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center border border-[#6a5018] shadow-sm"
               style={{ background: "linear-gradient(135deg, #6a5018, #b89448)" }}>
            <span className="text-[13px] font-semibold text-[#f5ead0] tracking-wide">{initials}</span>
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
              className="flex items-center gap-3 bg-[#f5ead0] border border-[#c8bea8] rounded-2xl p-4 hover:bg-[#ede0c0] transition-all active:scale-[0.99]"
            >
              <div className="w-10 h-10 bg-[#e8e0d0] border border-[#c8bea8] rounded-[13px] flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4.5 h-4.5 text-[#8a6e28]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1c1408] leading-snug">Verify your identity</p>
                <p className="text-[11px] text-[#5c4c30] mt-0.5 leading-relaxed">
                  Complete KYC to unlock transfers and get your account number.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8a6e28] flex-shrink-0" />
            </Link>
          )}

          {/* ── Balance card ── */}
          <div className="relative rounded-[14px] p-6 overflow-hidden border border-[#c8bea8] shadow-sm bg-[#f2ece0]">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#9a8a68] mb-2">
              Main Balance
            </p>
            <p className="font-mono text-[34px] font-semibold text-[#1c1408] leading-none tracking-tight mb-5">
              {formatMoney(account.balance, account.currency)}
            </p>

            <div className="h-px bg-[#d8d0bc] mb-4" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#1c1408] leading-none"
                   style={{ fontFamily: "'Playfair Display', serif" }}>
                  {session.user.name}
                </p>
                <p className="font-mono text-[11px] text-[#9a8a68] tracking-[0.15em] mt-1.5">
                  {isVerified && account.accountNumber
                    ? fmtAcctNum(account.accountNumber)
                    : "— Pending KYC —"}
                </p>
              </div>
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-[#eef6f1] border border-[#b8d8c8] px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2a7a58]" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#2a7a58]">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#f5ead0] border border-[#c8bea8] px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8a6e28]" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#8a6e28]">Unverified</span>
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
                className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-[#f2ece0] border border-[#c8bea8] shadow-sm hover:border-[#b89448] transition-all active:scale-[0.97]"
              >
                <div className="w-9 h-9 rounded-full bg-[#1c1408]/[0.07] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#1c1408]" strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#5c4c30]">Send</span>
              </Link>
            ) : (
              <span className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-[#f2ece0] border border-[#c8bea8] shadow-sm cursor-not-allowed opacity-40 select-none">
                <div className="w-9 h-9 rounded-full bg-[#1c1408]/[0.07] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#1c1408]" strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#5c4c30]">Send</span>
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
              className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-[#f2ece0] border border-[#c8bea8] shadow-sm hover:border-[#b89448] transition-all active:scale-[0.97]"
            >
              <div className="w-9 h-9 rounded-full bg-[#e8e0d0] flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-[#586058]" strokeWidth={1.8} />
              </div>
              <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#5c4c30]">History</span>
            </Link>

            {/* More */}
            <MoreSheet />

          </div>

          {/* ── Account details ── */}
          <div className="bg-[#f2ece0] rounded-2xl border border-[#c8bea8] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-[#1c1408]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Account Details
              </p>
            </div>

            {/* Account number */}
            <div className="bg-[#e8e0d0] rounded-[12px] px-4 py-3 mb-3">
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9a8a68] mb-1.5">
                Account Number
              </p>
              {isVerified && account.accountNumber ? (
                <p className="font-mono text-[16px] font-semibold text-[#1c1408] tracking-[0.1em]">
                  {fmtAcctNum(account.accountNumber)}
                </p>
              ) : (
                <p className="font-mono text-[13px] text-[#9a8a68]">— Pending KYC —</p>
              )}
            </div>

            {/* Account type row */}
            <div className="flex items-center justify-between px-1 mb-3">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[#9a8a68] mb-1">Account Type</p>
                <p className="font-mono text-[13px] text-[#1c1408] font-medium">Current Account</p>
              </div>
              <span className="text-[10px] text-[#9a8a68]">Personal</span>
            </div>

            {/* Pills */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#8a6e28]/[0.08] border border-[#8a6e28]/[0.2] rounded-lg px-3 py-1.5">
                <Wallet className="w-3 h-3 text-[#8a6e28]" />
                <span className="text-[11px] font-bold text-[#8a6e28] tracking-[0.06em]">{account.currency}</span>
              </div>
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-[#eef6f1] border border-[#b8d8c8] rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2a7a58]" />
                  <span className="text-[11px] font-bold text-[#2a7a58]">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#f5ead0] border border-[#c8bea8] rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8a6e28]" />
                  <span className="text-[11px] font-bold text-[#8a6e28]">Unverified</span>
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
            className="bg-[#f2ece0] rounded-2xl border border-[#c8bea8] shadow-sm p-5 flex items-center justify-between hover:border-[#b89448] hover:shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#eef6f1] border border-[#b8d8c8] rounded-[14px] flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-[#2a7a58]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1c1408]">Transaction Summary</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#5c4c30]">
                    In:{" "}
                    <span className="font-mono font-bold text-[#2a7a58]">
                      {formatMoney(totalCredited, account.currency)}
                    </span>
                  </span>
                  <span className="text-[#d8d0bc]">·</span>
                  <span className="text-[11px] text-[#5c4c30]">
                    Out:{" "}
                    <span className="font-mono font-bold text-[#1c1408]">
                      {formatMoney(totalDebited, account.currency)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#c8bea8] group-hover:text-[#8a6e28] transition-colors flex-shrink-0" />
          </Link>

          {/* ── Spending overview ── */}
          <div className="bg-[#f2ece0] rounded-2xl border border-[#c8bea8] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d8d0bc]">
              <p className="text-[13px] font-semibold text-[#1c1408]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Spending Overview
              </p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6a5018]">
                Details →
              </Link>
            </div>
            <div className="flex items-center gap-5 p-5">
              {/* Donut */}
              <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
                <circle cx="45" cy="45" r="32" fill="none" stroke="#d8d0bc" strokeWidth="12" />
                {totalCredited > 0 && (
                  <circle cx="45" cy="45" r="32" fill="none" stroke="#2a7a58" strokeWidth="12"
                    strokeDasharray={`${creditPct} ${circumference - creditPct}`}
                    strokeDashoffset="0" strokeLinecap="butt"
                    transform="rotate(-90 45 45)"
                  />
                )}
                {totalDebited > 0 && (
                  <circle cx="45" cy="45" r="32" fill="none" stroke="#8a9088" strokeWidth="12"
                    strokeDasharray={`${debitPct} ${circumference - debitPct}`}
                    strokeDashoffset={`-${creditPct}`} strokeLinecap="butt"
                    transform="rotate(-90 45 45)"
                  />
                )}
                <text x="45" y="41" textAnchor="middle" fontSize="9" fontFamily="monospace"
                      fontWeight="700" fill="#1c1408">
                  {formatMoney(account.balance, account.currency).replace(/\.00$/, "")}
                </text>
                <text x="45" y="52" textAnchor="middle" fontSize="8" fill="#9a8a68">balance</text>
              </svg>

              {/* Legend */}
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { color: "#2a7a58", label: "Credits", val: totalCredited },
                  { color: "#8a9088", label: "Debits",  val: totalDebited  },
                ].map(({ color, label, val }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[11px] text-[#5c4c30] font-medium flex-1 tracking-[0.03em]">{label}</span>
                    <span className="font-mono text-[12px] font-semibold text-[#1c1408]">
                      {formatMoney(val, account.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent activity (mobile / col-2 on desktop) ── */}
          <div className="bg-[#f2ece0] rounded-2xl border border-[#c8bea8] shadow-sm overflow-hidden lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d8d0bc]">
              <p className="text-[13px] font-semibold text-[#1c1408]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Recent Transactions
              </p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6a5018]">
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <CreditCard className="w-7 h-7 text-[#c8bea8] mb-3" />
                <p className="text-[12px] font-semibold text-[#9a8a68]">No transactions yet</p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 4).map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id}
                         className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e8e0d0] last:border-0 hover:bg-[#ede5d5] transition-colors">
                      <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1c1408]">{cfg.label}</p>
                        <p className="text-[10px] text-[#9a8a68] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-[13px] font-bold font-mono",
                          tx.type === "CREDIT" ? "text-[#2a7a58]" : "text-[#1c1408]")}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#9a8a68] tracking-[0.1em] uppercase mt-0.5">Cleared</p>
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
          <div className="bg-[#f2ece0] rounded-2xl border border-[#c8bea8] shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d8d0bc]">
              <p className="text-[13px] font-semibold text-[#1c1408]"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Recent Transactions
              </p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6a5018]">
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <CreditCard className="w-7 h-7 text-[#c8bea8] mb-3" />
                <p className="text-[12px] font-semibold text-[#9a8a68]">No transactions yet</p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 6).map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id}
                         className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e8e0d0] last:border-0 hover:bg-[#ede5d5] transition-colors">
                      <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1c1408]">
                          {tx.note ?? cfg.label}
                        </p>
                        <p className="text-[10px] text-[#9a8a68] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-[13px] font-bold font-mono",
                          tx.type === "CREDIT" ? "text-[#2a7a58]" : "text-[#1c1408]")}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#9a8a68] tracking-[0.1em] uppercase mt-0.5">Cleared</p>
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
        <div className="hidden lg:block bg-[#f2ece0] rounded-2xl border border-[#c8bea8] shadow-sm overflow-hidden mx-8 mb-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8d0bc]">
            <p className="text-[14px] font-semibold text-[#1c1408]"
               style={{ fontFamily: "'Playfair Display', serif" }}>
              All Recent Transactions
            </p>
            <Link href="/transactions"
                  className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6a5018]">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#e8e0d0]">
            {account.transactions.map((tx) => {
              const cfg  = TX_CONFIG[tx.type];
              const Icon = cfg.icon;
              return (
                <div key={tx.id}
                     className="flex items-center gap-4 px-6 py-4 hover:bg-[#ede5d5] transition-colors">
                  <div className={cn("w-10 h-10 rounded-[13px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                    <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1c1408]">
                      {tx.note ?? cfg.label}
                    </p>
                    <p className="text-[11px] text-[#9a8a68] font-mono tracking-[0.03em] mt-0.5">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[9px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full bg-[#e8e0d0] text-[#9a8a68] border border-[#c8bea8]">
                      Cleared
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn("text-[14px] font-bold font-mono",
                      tx.type === "CREDIT" ? "text-[#2a7a58]" : "text-[#1c1408]")}>
                      {cfg.sign}{formatMoney(tx.amount, account.currency)}
                    </p>
                    <p className="text-[10px] text-[#9a8a68] font-mono mt-0.5">
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
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#ddd5c3] border-t border-[#c8bea8] shadow-[0_-4px_16px_rgba(80,50,10,0.12)]">
        <div className="grid grid-cols-5 pb-safe">
          {[
            { label: "Overview",  icon: Home,         href: "/dashboard",    active: true  },
            { label: "Accounts",  icon: LayoutGrid,   href: "/accounts",     active: false },
            { label: "Transfer",  icon: ArrowUpRight, href: isVerified ? "/send" : null, active: false },
            { label: "Analytics", icon: BarChart2,    href: "/transactions", active: false },
            { label: "Profile",   icon: User,         href: "/profile",      active: false },
          ].map(({ label, icon: Icon, href, active }) => {
            const cls = `flex flex-col items-center gap-1 py-3 px-1 transition-colors ${
              active ? "text-[#2a7a58]" : "text-[#9a8a68] hover:text-[#5c4c30]"
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
