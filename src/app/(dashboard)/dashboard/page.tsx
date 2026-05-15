import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, maskAccountNumber, cn } from "@/lib/utils";
import {
  ArrowDownLeft, ArrowUpRight, ClipboardList,
  TrendingUp, TrendingDown, Sparkles,
  ShieldAlert, ArrowRight, CreditCard,
} from "lucide-react";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; sign: string;
}> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, bg: "bg-emerald-50", text: "text-emerald-600", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  bg: "bg-rose-50",    text: "text-rose-500",    sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  bg: "bg-rose-50",    text: "text-rose-500",    sign: "−" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where:   { id: session.user.id },
    select:  { kycStatus: true },
  });

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 6 } },
  });

  if (!account) redirect("/login");

  const isVerified    = user?.kycStatus === "VERIFIED";
  const pendingWithdrawal = await prisma.withdrawalRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });

  const totalCredited = account.transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);
  const totalDebited = account.transactions
    .filter((t) => t.type !== "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Greeting */}
      <div className="mb-7 fade-up">
        <p className="text-slate-400 text-sm font-medium mb-0.5">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{firstName} 👋</h1>
      </div>

      <div className="max-w-4xl space-y-4">

        {/* ── KYC Banner (unverified only) ─────────────────── */}
        {!isVerified && (
          <Link href="/kyc"
            className="fade-up block rounded-2xl overflow-hidden border border-amber-200/80 hover:border-amber-300 transition-all group"
            style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}>
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-amber-900">Verify your identity to activate your account</p>
                <p className="text-[12px] text-amber-700 mt-0.5">
                  Complete KYC verification to get your account number and start using NexaBank.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 group-hover:bg-amber-600 transition-colors">
                Verify now
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
            {/* Progress bar teaser */}
            <div className="h-1 bg-amber-100">
              <div className="h-1 w-1/3 bg-amber-400 rounded-full" />
            </div>
          </Link>
        )}

        {/* ── Balance hero card ─────────────────────────────── */}
        <div className="fade-up delay-1 relative overflow-hidden rounded-2xl p-7"
          style={{
            background: "linear-gradient(135deg, #1a3a6b 0%, #1e4fb5 45%, #3b82f6 100%)",
            boxShadow:  "0 20px 60px rgba(37,99,235,0.3), 0 4px 16px rgba(37,99,235,0.15)",
          }}>
          {/* Decorative shapes */}
          <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-white/[0.05] blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
          <div className="absolute top-4 right-20 w-24 h-24 rounded-full border border-white/[0.08] pointer-events-none" />

          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1.5">Available Balance</p>
                <p className="text-white text-4xl font-semibold money tracking-tight">
                  {formatMoney(account.balance, account.currency)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
                <span className="text-white/90 text-xs font-bold tracking-wider">{account.currency}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isVerified ? (
                <Link href="/withdraw"
                  className="flex items-center gap-2 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </Link>
              ) : (
                <span className="flex items-center gap-2 bg-white/20 text-white/60 text-sm font-medium px-4 py-2 rounded-xl cursor-not-allowed">
                  <ArrowUpRight className="w-4 h-4" />
                  Withdraw
                </span>
              )}
              <Link href="/transactions"
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                <ClipboardList className="w-4 h-4" />
                History
              </Link>
              {pendingWithdrawal && (
                <div className="flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-200 text-xs font-medium px-3 py-2 rounded-xl">
                  <span className="pulse-dot">Withdrawal pending</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Account number card (verified only) ──────────── */}
        {isVerified && account.accountNumber && (
          <div className="fade-up delay-2 card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Account Number</p>
              <p className="text-xl font-bold text-slate-900 money tracking-[0.1em]">
                {account.accountNumber.slice(0, 5)}{" "}{account.accountNumber.slice(5)}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-slate-400">{account.currency} Account</p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">● Active</p>
            </div>
          </div>
        )}

        {/* ── Stats row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 fade-up delay-2">
          {[
            {
              label:      "Total Credited",
              value:      totalCredited,
              icon:       TrendingUp,
              iconBg:     "bg-emerald-50",
              iconColor:  "text-emerald-600",
              valueColor: "text-emerald-700",
            },
            {
              label:      "Total Withdrawn",
              value:      totalDebited,
              icon:       TrendingDown,
              iconBg:     "bg-rose-50",
              iconColor:  "text-rose-500",
              valueColor: "text-slate-800",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card p-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.iconBg)}>
                  <Icon className={cn("w-5 h-5", stat.iconColor)} strokeWidth={2} />
                </div>
                <p className={cn("text-2xl font-semibold money tracking-tight", stat.valueColor)}>
                  {formatMoney(stat.value, account.currency)}
                </p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Recent transactions ────────────────────────────── */}
        <div className="card fade-up delay-3">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h2 className="text-[14px] font-semibold text-slate-800">Recent Transactions</h2>
            </div>
            <Link href="/transactions"
              className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all →
            </Link>
          </div>

          {account.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
              <p className="text-slate-400 text-xs mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {account.transactions.map((tx) => {
                const cfg  = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-4.5 h-4.5", cfg.text)} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-slate-800">{cfg.label}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5 truncate">
                        {tx.note ?? formatDateTime(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn("text-[14px] font-semibold money", tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-700")}>
                        {cfg.sign}{formatMoney(tx.amount, account.currency)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Bal: {formatMoney(tx.balanceAfter, account.currency)}
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
  );
}
