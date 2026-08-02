import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BiometricPrompt } from "@/components/BiometricPrompt";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { BalanceCard } from "@/components/balance-card";
import { CopyButton } from "@/components/copy-button";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  BarChart2,
  Bell,
  Send,
  ClipboardList,
  CreditCard,
  Landmark,
} from "lucide-react";
import ReceiveSheet from "./ReceiveSheet";
import LoanSheet from "./LoanSheet";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Overview — NexaBank",
};

const TX_CONFIG: Record<
  TransactionType,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    text: string;
    sign: string;
    border: string;
  }
> = {
  CREDIT: {
    label: "Credit",
    icon: ArrowDownLeft,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    sign: "+",
  },
  DEBIT: {
    label: "Debit",
    icon: ArrowUpRight,
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    sign: "−",
  },
  WITHDRAWAL: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    sign: "−",
  },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { webAuthnCredentials: true },
  });

  const hasPasskey = (user?.webAuthnCredentials?.length ?? 0) > 0;

  const account = await prisma.account.findUnique({
    where: { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 8 } },
  });

  if (!account) redirect("/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

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
  const debitPct = (totalDebited / total) * circumference;

  const firstName = session.user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const initials = session.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fmtAcctNum = (n: string) => `${n.slice(0, 5)}  ${n.slice(5)}`;

  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans pb-24 lg:pb-10">
      {/* ── Header ─────────────────────────────── */}
      {/* ── Header ─────────────────────────────── */}
<header className="px-5 pt-5 pb-3 bg-[#f0f7f4]">
  <div className="max-w-lg mx-auto lg:max-w-none flex items-start justify-between">
    <div>
      <h1
        className="text-[26px] font-bold text-[#0f2419] leading-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {greeting}, {firstName}
      </h1>
      {/* subtitle removed */}
    </div>
    <div className="flex items-center gap-3">
      {/* bell + avatar unchanged */}

            <Link
              href="/dashboard/notifications"
              className="relative w-10 h-10 rounded-full bg-white border border-[#c8dfd5] flex items-center justify-center shadow-sm hover:shadow-md hover:border-[#4daa80] transition-all"
            >
              <Bell className="w-4 h-4 text-[#2d5042]" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 flex items-center justify-center border-2 border-[#f0f7f4]">
                  <span className="text-[8px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </Link>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md"
              style={{
                background: "linear-gradient(135deg, #1a6648, #3daa7a)",
              }}
            >
              <span className="text-[13px] font-semibold text-white tracking-wide">
                {initials}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 max-w-lg mx-auto lg:max-w-none lg:grid lg:grid-cols-3 lg:gap-6 lg:px-8">
        {/* ══ COLUMN 1 ══════════════════════════════════ */}
        <div className="flex flex-col gap-4">
          {!isVerified && (
            <Link
              href="/kyc"
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100/60 transition-all active:scale-[0.99]"
            >
              <div className="w-10 h-10 bg-amber-100 border border-amber-200 rounded-[13px] flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#0f2419] leading-snug">
                  Verify your identity
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Complete KYC to unlock transfers and get your account number.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0" />
            </Link>
          )}

          <BalanceCard balance={account.balance} currency={account.currency} />

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {isVerified ? (
              <Link
                href="/withdraw"
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-100 group-hover:scale-105 transition-all shadow-sm">
                  <Send className="w-5 h-5 text-emerald-700" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Send
                </span>
              </Link>
            ) : (
              <span className="flex flex-col items-center gap-2 opacity-40 select-none cursor-not-allowed">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-emerald-700" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Send
                </span>
              </span>
            )}

            <ReceiveSheet
              name={session.user.name}
              accountNumber={
                isVerified && account.accountNumber
                  ? fmtAcctNum(account.accountNumber)
                  : null
              }
              sortCode="20 — 14 — 53"
              currency={account.currency}
              isVerified={isVerified}
            />

            <Link
              href="/transactions"
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 group-hover:scale-105 transition-all shadow-sm">
                <ClipboardList
                  className="w-5 h-5 text-slate-600"
                  strokeWidth={2}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                History
              </span>
            </Link>

            {isVerified ? (
              <LoanSheet currency={account.currency} />
            ) : (
              <span className="flex flex-col items-center gap-2 opacity-40 select-none cursor-not-allowed">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Landmark
                    className="w-5 h-5 text-amber-700"
                    strokeWidth={2}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Loan
                </span>
              </span>
            )}
          </div>

          {/* Monthly Pulse */}
          <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-[#0f2419]">
                Monthly Activity
              </p>
              <span className="text-[10px] text-[#6a8c7a] font-medium">
                This month
              </span>
            </div>
            <div className="h-2.5 bg-[#f0f7f4] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-600 rounded-l-full"
                style={{ width: `${(totalCredited / total) * 100}%` }}
              />
              <div
                className="h-full bg-rose-500 rounded-r-full"
                style={{ width: `${(totalDebited / total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2.5 text-[11px] font-medium">
              <span className="text-emerald-700">
                In {formatMoney(totalCredited, account.currency)}
              </span>
              <span className="text-rose-600">
                Out {formatMoney(totalDebited, account.currency)}
              </span>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm p-5">
            <h3
              className="text-[15px] font-semibold text-[#0f2419] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Account Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#6a8c7a] mb-1">
                  Account Number
                </p>
                <div className="flex items-center gap-2">
                  {isVerified && account.accountNumber ? (
                    <>
                      <p className="font-mono text-[15px] font-semibold text-[#0f2419] tracking-wider">
                        {fmtAcctNum(account.accountNumber)}
                      </p>
                      <CopyButton text={account.accountNumber} />
                    </>
                  ) : (
                    <p className="font-mono text-[13px] text-[#6a8c7a]">
                      — Pending KYC —
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#6a8c7a] mb-1">
                  Account Type
                </p>
                <p className="text-[14px] font-medium text-[#0f2419]">
                  Current Account
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#6a8c7a] mb-1">
                  Category
                </p>
                <p className="text-[14px] font-medium text-[#0f2419]">Personal</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#6a8c7a] mb-1">
                  Currency
                </p>
                <p className="text-[14px] font-medium text-[#0f2419]">
                  {account.currency}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#f0f7f4]">
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span className="text-[11px] font-bold text-emerald-700">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-bold text-amber-700">
                    Unverified
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ COLUMN 2 ══════════════════════════════════ */}
        <div className="flex flex-col gap-4 mt-4 lg:mt-0">
          <Link
            href="/transactions"
            className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm p-5 flex items-center justify-between hover:border-[#4daa80] hover:shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-[14px] flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0f2419]">
                  Transaction Summary
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-[#2d5042]">
                    In:{" "}
                    <span className="font-mono font-bold text-emerald-700">
                      {formatMoney(totalCredited, account.currency)}
                    </span>
                  </span>
                  <span className="text-[#c8dfd5]">·</span>
                  <span className="text-[11px] text-[#2d5042]">
                    Out:{" "}
                    <span className="font-mono font-bold text-rose-600">
                      {formatMoney(totalDebited, account.currency)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#c8dfd5] group-hover:text-[#1e7a52] transition-colors flex-shrink-0" />
          </Link>

          <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f7f4]">
              <p
                className="text-[14px] font-semibold text-[#0f2419]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Spending Overview
              </p>
              <Link
                href="/transactions"
                className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#155c3a]"
              >
                Details →
              </Link>
            </div>
            <div className="flex items-center gap-6 p-5">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                className="flex-shrink-0"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="#f0f7f4"
                  strokeWidth="14"
                />
                {totalCredited > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="14"
                    strokeDasharray={`${creditPct} ${circumference - creditPct}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                )}
                {totalDebited > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="14"
                    strokeDasharray={`${debitPct} ${circumference - debitPct}`}
                    strokeDashoffset={`-${creditPct}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                )}
                <text
                  x="50"
                  y="46"
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="700"
                  fill="#0f2419"
                >
                  {formatMoney(account.balance, account.currency).replace(
                    /\.00$/,
                    ""
                  )}
                </text>
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#6a8c7a"
                >
                  balance
                </text>
              </svg>
              <div className="flex flex-col gap-3 flex-1">
                {[
                  { color: "bg-emerald-600", label: "Credits", val: totalCredited },
                  { color: "bg-emerald-400", label: "Debits", val: totalDebited },
                ].map(({ color, label, val }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span
                      className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", color)}
                    />
                    <span className="text-[11px] text-[#2d5042] font-medium flex-1 tracking-[0.03em]">
                      {label}
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-[#0f2419]">
                      {formatMoney(val, account.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile transactions */}
          <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f7f4]">
              <p
                className="text-[14px] font-semibold text-[#0f2419]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Recent Transactions
              </p>
              <Link
                href="/transactions"
                className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#155c3a]"
              >
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <CreditCard className="w-8 h-8 text-[#c8dfd5] mb-3" />
                <p className="text-[13px] font-semibold text-[#6a8c7a]">
                  No transactions yet
                </p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 4).map((tx) => {
                  const cfg = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f6faf8] last:border-0 hover:bg-[#f6faf8] transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0",
                          cfg.bg,
                          cfg.border
                        )}
                      >
                        <Icon
                          className={cn("w-4 h-4", cfg.text)}
                          strokeWidth={2.5}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0f2419]">
                          {cfg.label}
                        </p>
                        <p className="text-[10px] text-[#6a8c7a] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={cn(
                            "text-[13px] font-bold font-mono",
                            tx.type === "CREDIT"
                              ? "text-emerald-700"
                              : "text-rose-600"
                          )}
                        >
                          {cfg.sign}
                          {formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#6a8c7a] tracking-[0.1em] uppercase mt-0.5">
                          Cleared
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ COLUMN 3 — desktop only ════════════════════ */}
        <div className="hidden lg:flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f7f4]">
              <p
                className="text-[14px] font-semibold text-[#0f2419]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Recent Transactions
              </p>
              <Link
                href="/transactions"
                className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#155c3a]"
              >
                See all →
              </Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <CreditCard className="w-8 h-8 text-[#c8dfd5] mb-3" />
                <p className="text-[13px] font-semibold text-[#6a8c7a]">
                  No transactions yet
                </p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 6).map((tx) => {
                  const cfg = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f6faf8] last:border-0 hover:bg-[#f6faf8] transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0",
                          cfg.bg,
                          cfg.border
                        )}
                      >
                        <Icon
                          className={cn("w-4 h-4", cfg.text)}
                          strokeWidth={2.5}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0f2419]">
                          {tx.note ?? cfg.label}
                        </p>
                        <p className="text-[10px] text-[#6a8c7a] font-mono tracking-[0.04em] mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={cn(
                            "text-[13px] font-bold font-mono",
                            tx.type === "CREDIT"
                              ? "text-emerald-700"
                              : "text-rose-600"
                          )}
                        >
                          {cfg.sign}
                          {formatMoney(tx.amount, account.currency)}
                        </p>
                        <p className="text-[9px] text-[#6a8c7a] tracking-[0.1em] uppercase mt-0.5">
                          Cleared
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop wide transactions */}
      {account.transactions.length > 0 && (
        <div className="hidden lg:block bg-white rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden mx-8 mt-6 mb-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f7f4]">
            <p
              className="text-[15px] font-semibold text-[#0f2419]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              All Recent Transactions
            </p>
            <Link
              href="/transactions"
              className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#155c3a]"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#f6faf8]">
            {account.transactions.map((tx) => {
              const cfg = TX_CONFIG[tx.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#f6faf8] transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0",
                      cfg.bg,
                      cfg.border
                    )}
                  >
                    <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0f2419]">
                      {tx.note ?? cfg.label}
                    </p>
                    <p className="text-[11px] text-[#6a8c7a] font-mono tracking-[0.03em] mt-0.5">
                      {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[9px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full bg-[#f6faf8] text-[#6a8c7a] border border-[#e4f2ec]">
                      Cleared
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={cn(
                        "text-[14px] font-bold font-mono",
                        tx.type === "CREDIT"
                          ? "text-emerald-700"
                          : "text-rose-600"
                      )}
                    >
                      {cfg.sign}
                      {formatMoney(tx.amount, account.currency)}
                    </p>
                    <p className="text-[10px] text-[#6a8c7a] font-mono mt-0.5">
                      Bal: {formatMoney(tx.balanceAfter, account.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasPasskey && <BiometricPrompt />}
    </div>
  );
}
