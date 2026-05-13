import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { Users, ArrowDownToLine, Clock, CheckCircle2 } from "lucide-react";
import { Currency } from "@prisma/client";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  const [
    totalUsers,
    pendingWithdrawals,
    approvedToday,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({
      where: {
        status:    "APPROVED",
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.transaction.findMany({
      include: { account: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = [
    { label: "Total Users",          value: totalUsers,           icon: Users,           color: "text-blue-600 bg-blue-50" },
    { label: "Pending Withdrawals",  value: pendingWithdrawals,   icon: Clock,           color: "text-amber-600 bg-amber-50" },
    { label: "Approved Today",       value: approvedToday,        icon: CheckCircle2,    color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform summary</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No transactions yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                  tx.type === "CREDIT" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                )}>
                  {tx.type === "CREDIT" ? "+" : "−"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{tx.account.user.name}</p>
                  <p className="text-xs text-gray-400">{tx.note ?? tx.type} · {formatDateTime(tx.createdAt)}</p>
                </div>
                <p className={cn("text-sm font-semibold money flex-shrink-0", tx.type === "CREDIT" ? "text-green-600" : "text-gray-800")}>
                  {tx.type === "CREDIT" ? "+" : "−"}
                  {formatMoney(tx.amount, tx.account.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
