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

  const fmtAcctNum = (n: string) =>
    `${n.slice(0, 5)}  ${n.slice(5)}`;

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans">

      {/* ── Page header ─────────────────────────────── */}
      <div className="flex items-start justify-between px-5 pt-12 pb-5 border-b border-[#e4e7ec] bg-[#f5f6f8]">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#6b7280]"
             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            NexaBank
          </p>
          <h1 className="text-[22px] font-semibold text-[#111827] tracking-tight mt-0.5"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            Account Overview
          </h1>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {/* Bell */}
          <div className="w-9 h-9 rounded-full bg-white border border-[#e4e7ec] flex items-center justify-center shadow-sm">
            <Bell className="w-4 h-4 text-[#6b7280]" strokeWidth={1.5} />
          </div>
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#374151] flex items-center justify-center border border-[#e4e7ec] shadow-sm">
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
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100/60 transition-all active:scale-[0.99]"
            >
              <div className="w-10 h-10 bg-amber-100 border border-amber-200 rounded-[13px] flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-amber-900 leading-snug">Verify your identity</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Complete KYC to unlock transfers and get your account number.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
            </Link>
          )}

          {/* ── Balance card ── */}
          <div className="relative rounded-[16px] p-6 overflow-hidden border border-[#dde3ec] shadow-sm"
               style={{ background: "linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)" }}>
            {/* Decorative circle */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                 style={{ background: "radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)" }} />
            {/* Bottom teal line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px]"
                 style={{ background: "linear-gradient(90deg, transparent, rgba(13,148,136,0.4), transparent)" }} />

            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-2">
              Main Balance
            </p>
            <p className="font-mono text-[34px] font-semibold text-[#111827] leading-none tracking-tight mb-5">
              {formatMoney(account.balance, account.currency)}
            </p>

            <div className="h-px bg-[#e4e7ec] mb-4" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#111827] leading-none">
                  {session.user.name}
                </p>
                <p className="font-mono text-[11px] text-[#9ca3af] tracking-[0.15em] mt-1.5">
                  {isVerified && account.accountNumber
                    ? fmtAcctNum(account.accountNumber)
                    : "— Pending KYC —"}
                </p>
              </div>
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-[#f0fdf9] border border-[#bbf7e0] px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#0d9488]">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-amber-600">Unverified</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Quick actions ── */}
          <div className="grid grid-cols-4 gap-2.5">

            {/* Send → /withdraw (disabled if unverified) */}
            {isVerified ? (
              <Link
                href="/withdraw"
                className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#e4e7ec] shadow-sm hover:border-[#d1d5db] transition-all active:scale-[0.97]"
              >
                <div className="w-9 h-9 rounded-full bg-[#111827]/[0.07] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#111827]" strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#6b7280]">Send</span>
              </Link>
            ) : (
              <span className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#e4e7ec] shadow-sm cursor-not-allowed opacity-40 select-none">
                <div className="w-9 h-9 rounded-full bg-[#111827]/[0.07] flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#111827]" strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#6b7280]">Send</span>
              </span>
            )}

            {/* Receive → bottom sheet with account number, sort code, name */}
            <ReceiveSheet
              name={session.user.name}
              accountNumber={isVerified && account.accountNumber ? fmtAcctNum(account.accountNumber) : null}
              sortCode="20 — 14 — 53"
              currency={account.currency}
              isVerified={isVerified}
            />

            {/* History → /transactions */}
            <Link
              href="/transactions"
              className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#e4e7ec] shadow-sm hover:border-[#d1d5db] transition-all active:scale-[0.97]"
            >
              <div className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-[#6b7280]" strokeWidth={1.8} />
              </div>
              <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#6b7280]">History</span>
            </Link>

            {/* More → settings sheet */}
            <MoreSheet />

          </div>

          {/* ── Account details ── */}
          <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-[#111827]">Account Details</p>
              
            </div>

            {/* Account number */}
            <div className="bg-[#f5f6f8] rounded-[12px] px-4 py-3 mb-3">
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#9ca3af] mb-1.5">
                Account Number
              </p>
              {isVerified && account.accountNumber ? (
                <p className="font-mono text-[16px] font-semibold text-[#111827] tracking-[0.1em]">
                  {fmtAcctNum(account.accountNumber)}
                </p>
              ) : (
                <p className="font-mono text-[13px] text-[#9ca3af]">— Pending KYC —</p>
              )}
            </div>

            {/* Account type row */}
            <div className="flex items-center justify-between px-1 mb-3">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-[#9ca3af] mb-1">Account Type</p>
                <p className="font-mono text-[13px] text-[#111827] font-medium">Current Account</p>
              </div>
              <span className="text-[10px] text-[#9ca3af]">Personal</span>
            </div>

            {/* Pills */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#111827]/[0.06] border border-[#111827]/[0.12] rounded-lg px-3 py-1.5">
                <Wallet className="w-3 h-3 text-[#374151]" />
                <span className="text-[11px] font-bold text-[#374151] tracking-[0.06em]">{account.currency}</span>
              </div>
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-[#f0fdf9] border border-[#bbf7e0] rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
                  <span className="text-[11px] font-bold text-[#0d9488]">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[11px] font-bold text-amber-600">Unverified</span>
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
            className="bg-white rounded-2xl border border-[#e4e7ec] shadow-sm p-5 flex items-center justify-between hover:border-[#0d9488]/30 hover:shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-[#f0fdf9] border border-[#bbf7e0] rounded-[14px] flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-[#0d9488]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#111827]">Transaction Summary</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#6b7280]">
                    In:{" "}
                    <span className="font-mono font-bold text-[#0d9488]">
                      {formatMoney(totalCredited, account.currency)}
                    </span>
                  </span>
                  <span className="text-[#e4e7ec]">·</span>
                  <span className="text-[11px] text-[#6b7280]">
                    Out:{" "}
                    <span className="font-mono font-bold text-[#111827]">
                      {formatMoney(totalDebited, account.currency)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#d1d5db] group-hover:text-[#0d9488] transition-colors flex-shrink-0" />
          </Link>

          {/* ── Spending overview ── */}
          <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
              <p className="text-[13px] font-semibold text-[#111827]">Spending Overview</p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0d9488]">
                Details →
              </Link>
            </div>
            <div className="flex items-center gap-5 p-5">
              {/* Donut */}
              <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
                <circle cx="45" cy="45" r="32" fill="none" stroke="#e4e7ec" strokeWidth="12" />
                {totalCredited > 0 && (
                  <circle cx="45" cy="45" r="32" fill="none" stroke="#0d9488" strokeWidth="12"
                    strokeDasharray={`${creditPct} ${circumference - creditPct}`}
                    strokeDashoffset="0" strokeLinecap="butt"
                    transform="rotate(-90 45 45)"
                  />
                )}
                {totalDebited > 0 && (
                  <circle cx="45" cy="45" r="32" fill="none" stroke="#9ca3af" strokeWidth="12"
                    strokeDasharray={`${debitPct} ${circumference - debitPct}`}
                    strokeDashoffset={`-${creditPct}`} strokeLinecap="butt"
                    transform="rotate(-90 45 45)"
                  />
                )}
                <text x="45" y="41" textAnchor="middle" fontSize="9" fontFamily="monospace"
                      fontWeight="700" fill="#111827">
                  {formatMoney(account.balance, account.currency).replace(/\.00$/, "")}
                </text>
                <text x="45" y="52" textAnchor="middle" fontSize="8" fill="#9ca3af">balance</text>
              </svg>

              {/* Legend */}
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { color: "#0d9488", label: "Credits", val: totalCredited },
                  { color: "#9ca3af", label: "Debits",  val: totalDebited  },
                ].map(({ color, label, val }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[11px] text-[#6b7280] font-medium flex-1 tracking-[0.03em]">{label}</span>
                    <span className="font-mono text-[12px] font-semibold text-[#111827]">
                      {formatMoney(val, account.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent activity (mobile / col-2 on desktop) ── */}
          <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-sm overflow-hidden lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
              <p className="text-[13px] font-semibold text-[#111827]">Recent Transactions</p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0d9488]">
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <CreditCard className="w-7 h-7 text-[#e4e7ec] mb-3" />
                <p className="text-[12px] font-semibold text-[#9ca3af]">No transactions yet</p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 4).map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id}
                         className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f5f7fb] last:border-0 hover:bg-[#fafbff] transition-colors">
                      <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#111827]">{cfg.label}</p>
                        <p className="text-[10px] text-[#9ca3af] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-[13px] font-bold font-mono",
                          tx.type === "CREDIT" ? "text-[#0d9488]" : "text-[#111827]")}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#9ca3af] tracking-[0.1em] uppercase mt-0.5">Cleared</p>
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
          <div className="bg-white rounded-2xl border border-[#e4e7ec] shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
              <p className="text-[13px] font-semibold text-[#111827]">Recent Transactions</p>
              <Link href="/transactions" className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0d9488]">
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <CreditCard className="w-7 h-7 text-[#e4e7ec] mb-3" />
                <p className="text-[12px] font-semibold text-[#9ca3af]">No transactions yet</p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 6).map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id}
                         className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f5f7fb] last:border-0 hover:bg-[#fafbff] transition-colors">
                      <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#111827]">
                          {tx.note ?? cfg.label}
                        </p>
                        <p className="text-[10px] text-[#9ca3af] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn("text-[13px] font-bold font-mono",
                          tx.type === "CREDIT" ? "text-[#0d9488]" : "text-[#111827]")}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#9ca3af] tracking-[0.1em] uppercase mt-0.5">Cleared</p>
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
        <div className="hidden lg:block bg-white rounded-2xl border border-[#e4e7ec] shadow-sm overflow-hidden mx-8 mb-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f3f8]">
            <p className="text-[14px] font-semibold text-[#111827]">All Recent Transactions</p>
            <Link href="/transactions"
                  className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#0d9488]">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#f5f7fb]">
            {account.transactions.map((tx) => {
              const cfg  = TX_CONFIG[tx.type];
              const Icon = cfg.icon;
              return (
                <div key={tx.id}
                     className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafbff] transition-colors">
                  <div className={cn("w-10 h-10 rounded-[13px] border flex items-center justify-center flex-shrink-0", cfg.bg, cfg.border)}>
                    <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#111827]">
                      {tx.note ?? cfg.label}
                    </p>
                    <p className="text-[11px] text-[#9ca3af] font-mono tracking-[0.03em] mt-0.5">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[9px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full bg-[#f5f6f8] text-[#9ca3af] border border-[#e4e7ec]">
                      Cleared
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn("text-[14px] font-bold font-mono",
                      tx.type === "CREDIT" ? "text-[#0d9488]" : "text-[#111827]")}>
                      {cfg.sign}{formatMoney(tx.amount, account.currency)}
                    </p>
                    <p className="text-[10px] text-[#9ca3af] font-mono mt-0.5">
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
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#e4e7ec] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 pb-safe">
          {[
            { label: "Home",      icon: Home,         href: "/dashboard",    active: true  },
            { label: "Accounts",  icon: LayoutGrid,   href: "/accounts",     active: false },
            { label: "Transfer",  icon: ArrowUpRight, href: isVerified ? "/send" : null, active: false },
            { label: "Analytics", icon: BarChart2,    href: "/transactions", active: false },
            { label: "Profile",   icon: User,         href: "/profile",      active: false },
          ].map(({ label, icon: Icon, href, active }) => {
            const cls = `flex flex-col items-center gap-1 py-3 px-1 transition-colors ${
              active ? "text-[#0d9488]" : "text-[#9ca3af] hover:text-[#6b7280]"
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
