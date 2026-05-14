import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatMoney, formatDateTime, getInitials, cn } from "@/lib/utils";
import { FundForm } from "@/components/fund-form";
import { ArrowDownLeft, ArrowUpRight, ArrowLeft } from "lucide-react";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin — User Detail" };

const TX_CONFIG: Record<TransactionType, { label: string; icon: React.ElementType; bg: string; text: string; sign: string }> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, bg: "bg-emerald-50", text: "text-emerald-600", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  bg: "bg-rose-50",    text: "text-rose-500",    sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  bg: "bg-rose-50",    text: "text-rose-500",    sign: "−" },
};

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where:   { id: params.id },
    include: {
      account: {
        include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
      },
    },
  });

  if (!user || user.role === "ADMIN") notFound();

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-3xl">
        {/* Back */}
        <Link href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6 fade-up">
          <ArrowLeft className="w-4 h-4" />
          Back to users
        </Link>

        {/* User header */}
        <div className="flex items-center gap-4 mb-6 fade-up delay-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-200">
            {getInitials(user.name)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{user.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Balance card */}
        {user.account && (
          <div className="fade-up delay-1 mb-5 relative overflow-hidden rounded-2xl p-6"
            style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #1e4fb5 50%, #3b82f6 100%)", boxShadow: "0 12px 40px rgba(37,99,235,0.25)" }}>
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.05] blur-xl" />
            <p className="text-blue-200 text-sm mb-1">Current Balance</p>
            <p className="text-white text-3xl font-semibold money tracking-tight">
              {formatMoney(user.account.balance, user.account.currency)}
            </p>
            <p className="text-blue-300 text-xs mt-1">{user.account.currency} Account</p>
          </div>
        )}

        {/* Fund form */}
        {user.account && (
          <div className="card p-6 mb-5 fade-up delay-2">
            <h2 className="text-[14px] font-semibold text-slate-800 mb-5">Adjust Balance</h2>
            <FundForm
              userId={user.id}
              currency={user.account.currency}
              currentBalance={user.account.balance / 100}
            />
          </div>
        )}

        {/* Transaction history */}
        {user.account && (
          <div className="card fade-up delay-3">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-slate-800">Transaction History</h2>
            </div>
            {user.account.transactions.length === 0 ? (
              <div className="py-14 text-center text-sm text-slate-400">No transactions yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {user.account.transactions.map((tx) => {
                  const cfg = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-800">{cfg.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{tx.note ?? "—"} · {formatDateTime(tx.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-[13px] font-semibold money", tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-700")}>
                          {cfg.sign}{formatMoney(tx.amount, user.account!.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
