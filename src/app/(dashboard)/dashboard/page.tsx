import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  ArrowDownLeft, ArrowUpRight, Clock,
  TrendingUp, TrendingDown, Sparkles, ClipboardList,
} from "lucide-react";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; sign: string;
}> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, bg: "bg-emerald-50",  text: "text-emerald-600", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  bg: "bg-rose-50",     text: "text-rose-500",    sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  bg: "bg-rose-50",     text: "text-rose-500",    sign: "−" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });

  if (!account) redirect("/login");

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
      {/* Page header */}
      <div className="mb-7 fade-up">
        <p className="text-slate-400 text-sm font-medium mb-0.5">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{firstName} 👋</h1>
      </div>

      <div className="max-w-4xl space-y-5">
        {/* Balance hero card */}
        <div className="fade-up delay-1 relative overflow-hidden rounded-2xl p-7"
          style={{
            background: "linear-gradient(135deg, #1a3a6b 0%, #1e4fb5 40%, #2563eb 70%, #3b82f6 100%)",
            boxShadow: "0 20px 60px rgba(37,99,235,0.35), 0 4px 16px rgba(37,99,235,0.2)"
          }}>
          {/* Decorative blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/[0.06] blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-blue-400/20 blur-xl" />
          <div className="absolute top-4 right-16 w-20 h-20 rounded-full bg-white/[0.04]" />

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Available Balance</p>
                <p className="text-white text-4xl font-semibold money tracking-tight">
                  {formatMoney(account.balance, account.currency)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20">
                <span className="text-white/90 text-xs font-semibold tracking-wider">
                  {account.currency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/withdraw"
                className="flex items-center gap-2 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </Link>
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

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 fade-up delay-2">
          {[
            {
              label: "Total Credited",
              value: totalCredited,
              icon: TrendingUp,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
              valueColor: "text-emerald-700",
              border: "border-emerald-100/80",
            },
            {
              label: "Total Withdrawn",
              value: totalDebited,
              icon: TrendingDown,
              iconBg: "bg-rose-50",
              iconColor: "text-rose-500",
              valueColor: "text-slate-800",
              border: "border-rose-100/80",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={cn("card p-5 border", stat.border)}>
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

        {/* Recent transactions */}
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
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
              <p className="text-slate-400 text-xs mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {account.transactions.map((tx, i) => {
                const cfg  = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
                    style={{ animationDelay: `${0.25 + i * 0.04}s` }}>
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
