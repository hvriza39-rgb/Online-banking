import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  ArrowDownLeft, ArrowUpRight, ClipboardList,
  TrendingUp, TrendingDown, Sparkles,
  ShieldAlert, ShieldCheck, Clock,
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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      account: {
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 6 },
        },
      },
    },
  });

  if (!user || !user.account) redirect("/login");

  const account    = user.account;
  const kycStatus  = user.kycStatus;

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
      <div className="mb-7 fade-up">
        <p className="text-[#9aa0b0] text-sm font-medium mb-0.5">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
        </p>
        <h1 className="text-2xl font-semibold text-[#111318]">{firstName} 👋</h1>
      </div>

      <div className="max-w-4xl space-y-5">

        {/* KYC Banner */}
        {kycStatus === "NONE" && (
          <div className="fade-up flex items-start gap-4 p-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-amber-900">Verify your identity to unlock your account</p>
              <p className="text-[12px] text-amber-700 mt-0.5">
                Complete KYC verification to receive your account number and access full banking features.
              </p>
            </div>
            <Link href="/kyc"
              className="flex-shrink-0 text-[12.5px] font-semibold text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              style={{ background: "#c98a10" }}>
              Verify Now →
            </Link>
          </div>
        )}

        {kycStatus === "PENDING" && (
          <div className="fade-up flex items-start gap-4 p-5 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-sky-900">Identity verification under review</p>
              <p className="text-[12px] text-sky-700 mt-0.5">
                Your KYC documents are being reviewed. We&apos;ll notify you once approved.
              </p>
            </div>
          </div>
        )}

        {kycStatus === "APPROVED" && account.accountNumber && (
          <div className="fade-up flex items-start gap-4 p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-emerald-900">Identity verified</p>
              <p className="text-[12px] text-emerald-700 mt-0.5 font-mono tracking-wider">
                Account No: {account.accountNumber}
              </p>
            </div>
          </div>
        )}

        {/* Balance hero card */}
        <div className="fade-up delay-1 relative overflow-hidden rounded-2xl p-7"
          style={{
            background: "linear-gradient(135deg, #1a1c22 0%, #23262f 40%, #2c2f3a 70%, #1e2029 100%)",
            boxShadow: "0 20px 60px rgba(10,11,15,0.30), 0 4px 16px rgba(10,11,15,0.15)",
          }}>
          <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-amber-400/[0.07] blur-2xl" />
          <div className="absolute -bottom-8 left-16 w-40 h-40 rounded-full bg-amber-500/[0.05] blur-xl" />
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #c98a10 1px, transparent 1px)", backgroundSize: "12px 12px" }} />

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[#9aa0b0] text-sm font-medium mb-1">Available Balance</p>
                <p className="text-white text-4xl font-semibold money tracking-tight">
                  {formatMoney(account.balance, account.currency)}
                </p>
                {account.accountNumber && (
                  <p className="text-[#6b7280] text-xs font-mono mt-2 tracking-widest">
                    •••• {account.accountNumber.slice(-4)}
                  </p>
                )}
              </div>
              <div className="bg-white/[0.08] backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
                <span className="text-white/80 text-xs font-semibold tracking-wider">{account.currency}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/withdraw"
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
                style={{ background: "#c98a10", color: "#fff", boxShadow: "0 2px 8px rgba(201,138,16,0.35)" }}>
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </Link>
              <Link href="/transactions"
                className="flex items-center gap-2 bg-white/[0.08] border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/[0.14] transition-colors">
                <ClipboardList className="w-4 h-4" />
                History
              </Link>
              {pendingWithdrawal && (
                <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-medium px-3 py-2 rounded-xl">
                  <span className="pulse-dot">Withdrawal pending</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 fade-up delay-2">
          {[
            { label: "Total Credited",  value: totalCredited, icon: TrendingUp,   iconBg: "bg-emerald-50", iconColor: "text-emerald-600", valueColor: "text-emerald-700", border: "border-emerald-100/80" },
            { label: "Total Withdrawn", value: totalDebited,  icon: TrendingDown, iconBg: "bg-rose-50",    iconColor: "text-rose-500",    valueColor: "text-[#111318]",   border: "border-rose-100/80" },
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
                <p className="text-sm text-[#9aa0b0] mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Recent transactions */}
        <div className="card fade-up delay-3">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(17,19,24,0.06)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-[14px] font-semibold text-[#111318]">Recent Transactions</h2>
            </div>
            <Link href="/transactions" className="text-[12px] font-medium text-amber-600 hover:text-amber-700 transition-colors">
              View all →
            </Link>
          </div>

          {account.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#f4f5f7] border border-[rgba(17,19,24,0.07)] flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-[#c8cdd8]" />
              </div>
              <p className="text-[#5c6070] text-sm font-medium">No transactions yet</p>
              <p className="text-[#9aa0b0] text-xs mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(17,19,24,0.04)]">
              {account.transactions.map((tx, i) => {
                const cfg  = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f9f9fb] transition-colors"
                    style={{ animationDelay: `${0.25 + i * 0.04}s` }}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-[#111318]">{cfg.label}</p>
                      <p className="text-[12px] text-[#9aa0b0] mt-0.5 truncate">
                        {tx.note ?? formatDateTime(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn("text-[14px] font-semibold money", tx.type === "CREDIT" ? "text-emerald-600" : "text-[#111318]")}>
                        {cfg.sign}{formatMoney(tx.amount, account.currency)}
                      </p>
                      <p className="text-[11px] text-[#9aa0b0] mt-0.5">
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
