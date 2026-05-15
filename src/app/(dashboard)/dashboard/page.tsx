import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
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
    where:  { id: session.user.id },
    select: { kycStatus: true },
  });

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 6 } },
  });

  if (!account) redirect("/login");

  const isVerified = user?.kycStatus === "VERIFIED";

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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">

      {/* ── Greeting ───────────────────────────────────────── */}
      <div className="mb-5 fade-up">
        <p className="text-slate-400 text-sm font-medium mb-0.5">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">{firstName} 👋</h1>
      </div>

      <div className="max-w-4xl space-y-3 sm:space-y-4">

        {/* ── KYC Banner ─────────────────────────────────────── */}
        {!isVerified && (
          <Link href="/kyc"
            className="fade-up block rounded-2xl overflow-hidden border border-amber-200 hover:border-amber-300 transition-all active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" }}
          >
            <div className="p-4">
              {/* Top row: icon + title */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <p className="text-[13.5px] font-semibold text-amber-900 leading-tight">
                  Verify your identity to activate your account
                </p>
              </div>

              {/* Description */}
              <p className="text-[12px] text-amber-700 leading-relaxed mb-3 pl-12">
                Complete KYC to get your account number and unlock all features.
              </p>

              {/* CTA button — full width on mobile */}
              <div className="pl-12">
                <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg">
                  Verify now
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-amber-100">
              <div className="h-1 w-1/3 bg-amber-400" />
            </div>
          </Link>
        )}

        {/* ── Balance card ────────────────────────────────────── */}
        <div
          className="fade-up delay-1 relative overflow-hidden rounded-2xl p-5 sm:p-7"
          style={{
            background: "linear-gradient(135deg, #1a3a6b 0%, #1e4fb5 45%, #3b82f6 100%)",
            boxShadow: "0 16px 48px rgba(37,99,235,0.28), 0 4px 12px rgba(37,99,235,0.15)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.05] blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

          <div className="relative">
            {/* Currency badge */}
            <div className="flex items-start justify-between mb-4">
              <p className="text-blue-200 text-sm font-medium">Available Balance</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2.5 py-1 border border-white/20">
                <span className="text-white/90 text-xs font-bold tracking-wider">{account.currency}</span>
              </div>
            </div>

            {/* Balance amount */}
            <p className="text-white text-3xl sm:text-4xl font-semibold money tracking-tight mb-5">
              {formatMoney(account.balance, account.currency)}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {isVerified ? (
                <Link
                  href="/withdraw"
                  className="flex items-center gap-1.5 bg-white text-blue-700 text-[13px] font-semibold px-3.5 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm active:scale-[0.98]"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Withdraw
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 bg-white/20 text-white/50 text-[13px] font-medium px-3.5 py-2 rounded-xl cursor-not-allowed">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Withdraw
                </span>
              )}

              <Link
                href="/transactions"
                className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-[13px] font-medium px-3.5 py-2 rounded-xl hover:bg-white/20 transition-colors active:scale-[0.98]"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                History
              </Link>

              {pendingWithdrawal && (
                <span className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-200 text-[11px] font-medium px-2.5 py-2 rounded-xl">
                  ● Withdrawal pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Account number card (verified only) ──────────── */}
        {isVerified && account.accountNumber && (
          <div className="fade-up delay-2 card p-4 sm:p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                Account Number
              </p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 money tracking-[0.08em]">
                {account.accountNumber.slice(0, 5)}{" "}{account.accountNumber.slice(5)}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[11px] text-slate-400">{account.currency}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">● Active</p>
            </div>
          </div>
        )}

        {/* ── Stats row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 fade-up delay-2">
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
              <div key={stat.label} className="card p-4 sm:p-5">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", stat.iconBg)}>
                  <Icon className={cn("w-4 h-4", stat.iconColor)} strokeWidth={2} />
                </div>
                <p className={cn("text-xl sm:text-2xl font-semibold money tracking-tight", stat.valueColor)}>
                  {formatMoney(stat.value, account.currency)}
                </p>
                <p className="text-[11px] sm:text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Recent transactions ────────────────────────────── */}
        <div className="card fade-up delay-3">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h2 className="text-[13px] sm:text-[14px] font-semibold text-slate-800">
                Recent Transactions
              </h2>
            </div>
            <Link
              href="/transactions"
              className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all →
            </Link>
          </div>

          {account.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
              <p className="text-slate-400 text-xs mt-1">
                Your history will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {account.transactions.map((tx) => {
                const cfg  = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Icon */}
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
                    </div>

                    {/* Label + note */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-800">{cfg.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {tx.note ?? formatDateTime(tx.createdAt)}
                      </p>
                    </div>

                    {/* Amount + balance after */}
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        "text-[13px] font-semibold money",
                        tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-700"
                      )}>
                        {cfg.sign}{formatMoney(tx.amount, account.currency)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatMoney(tx.balanceAfter, account.currency)}
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
