import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { Users, ArrowDownToLine, Clock, CheckCircle2, Activity } from "lucide-react";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  const [totalUsers, pendingCount, approvedToday, recentTransactions] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({
      where: { status: "APPROVED", updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
    }),
    prisma.transaction.findMany({
      include: { account: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = [
    { label: "Total Users",          value: String(totalUsers),   icon: Users,          bg: "bg-blue-50",    iconColor: "text-blue-600",    sub: "registered accounts" },
    { label: "Pending Withdrawals",  value: String(pendingCount), icon: Clock,          bg: "bg-amber-50",   iconColor: "text-amber-600",   sub: "awaiting review" },
    { label: "Approved Today",       value: String(approvedToday),icon: CheckCircle2,   bg: "bg-emerald-50", iconColor: "text-emerald-600", sub: "processed today" },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Platform summary and recent activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 fade-up delay-1">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-5">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", s.bg)}>
                  <Icon className={cn("w-5 h-5", s.iconColor)} strokeWidth={2} />
                </div>
                <p className="text-3xl font-bold text-slate-900 money">{s.value}</p>
                <p className="text-[13px] font-medium text-slate-700 mt-1">{s.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Recent transactions */}
        <div className="card fade-up delay-2">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <Activity className="w-4 h-4 text-blue-500" />
            <h2 className="text-[14px] font-semibold text-slate-800">Recent Transactions</h2>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No transactions yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold",
                    tx.type === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                  )}>
                    {tx.type === "CREDIT" ? "+" : "−"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-800">{tx.account.user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {tx.note ?? tx.type.replace("_", " ")} · {formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn("text-[13px] font-semibold money", tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-700")}>
                      {tx.type === "CREDIT" ? "+" : "−"}{formatMoney(tx.amount, tx.account.currency)}
                    </p>
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      tx.type === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                    )}>
                      {tx.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
