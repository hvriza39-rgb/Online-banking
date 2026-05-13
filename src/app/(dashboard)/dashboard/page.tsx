import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionType } from "@prisma/client";

export const metadata: Metadata = { title: "Dashboard" };

const TX_CONFIG: Record<TransactionType, { label: string; icon: React.ElementType; color: string; sign: string }> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, color: "text-green-600 bg-green-50", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  color: "text-red-500 bg-red-50",     sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  color: "text-red-500 bg-red-50",     sign: "−" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!account) redirect("/login");

  const pendingWithdrawal = await prisma.withdrawalRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-sm text-blue-100 mb-1">Available Balance</p>
        <p className="text-4xl font-semibold tracking-tight money">
          {formatMoney(account.balance, account.currency)}
        </p>
        <p className="text-sm text-blue-200 mt-2">{account.currency} Account</p>
      </div>

      {/* Pending withdrawal notice */}
      {pendingWithdrawal && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Withdrawal pending</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {formatMoney(pendingWithdrawal.amount, pendingWithdrawal.currency)} is awaiting admin approval
            </p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Total Credited",
            value: account.transactions
              .filter((t) => t.type === "CREDIT")
              .reduce((s, t) => s + t.amount, 0),
            icon: ArrowDownLeft,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Total Withdrawn",
            value: account.transactions
              .filter((t) => t.type !== "CREDIT")
              .reduce((s, t) => s + t.amount, 0),
            icon: TrendingUp,
            color: "text-blue-600 bg-blue-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-semibold text-gray-900 money">
                {formatMoney(stat.value, account.currency)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
        </div>

        {account.transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {account.transactions.map((tx) => {
              const cfg  = TX_CONFIG[tx.type];
              const Icon = cfg.icon;
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
                    <p className="text-xs text-gray-400 truncate">{tx.note ?? formatDateTime(tx.createdAt)}</p>
                  </div>
                  <p className={cn("text-sm font-semibold money flex-shrink-0", tx.type === "CREDIT" ? "text-green-600" : "text-gray-800")}>
                    {cfg.sign}{formatMoney(tx.amount, account.currency)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
