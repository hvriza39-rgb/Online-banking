import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  Users,
  ArrowUpToLine,
  Clock,
  CheckCircle2,
  Activity,
  ShieldAlert,
  MessageSquare,
  ChevronRight,
  Bell,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminPage() {
  const [totalUsers, pendingKyc, pendingWithdrawals, approvedToday, recentTransactions] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { kycStatus: "PENDING" } }),
      prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
      prisma.withdrawalRequest.count({
        where: {
          status: "APPROVED",
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.transaction.findMany({
        include: { account: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const navCards = [
    {
      href: "/admin/support",
      icon: MessageSquare,
      label: "Support",
      badge: pendingKyc > 0 ? pendingKyc : null,
      badgeBg: "bg-blue-500",
      active: false,
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users",
      badge: totalUsers > 0 ? totalUsers : null,
      badgeBg: "bg-violet-500",
      active: false,
    },
    {
      href: "/admin/withdrawals",
      icon: ArrowUpToLine,
      label: "Withdrawals",
      badge: pendingWithdrawals > 0 ? pendingWithdrawals : null,
      badgeBg: "bg-orange-400",
      active: false,
    },
  ];

  const stats = [
    {
      label: "Total Users",
      value: String(totalUsers),
      icon: Users,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      sub: "registered accounts",
    },
    {
      label: "Pending Withdrawals",
      value: String(pendingWithdrawals),
      icon: Clock,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      sub: "awaiting review",
    },
    {
      label: "Approved Today",
      value: String(approvedToday),
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sub: "processed today",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto lg:max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-0.5">Welcome back</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Bell className="w-5 h-5 text-slate-600" />
            </div>
            {pendingKyc > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingKyc}
              </span>
            )}
          </div>
        </div>

        {/* Nav cards — full-width tiles like the screenshot */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {navCards.map(({ href, icon: Icon, label, badge, badgeBg }) => (
            <Link
              key={href}
              href={href}
              className="relative bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md active:scale-[0.97] transition-all min-h-[90px]"
            >
              {badge !== null && (
                <span
                  className={cn(
                    "absolute top-2.5 right-2.5 min-w-[20px] h-5 px-1.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center",
                    badgeBg
                  )}
                >
                  {badge}
                </span>
              )}
              <Icon className="w-6 h-6 text-slate-600" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-slate-700">{label}</span>
            </Link>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                  <Icon className={cn("w-4 h-4", s.iconColor)} strokeWidth={2} />
                </div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</p>
                <p className="text-[12px] font-medium text-slate-700 mt-0.5">{s.label}</p>
                <p className="text-[11px] text-slate-400">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Recent transactions — list style like the screenshot */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <Activity className="w-4 h-4 text-blue-500" />
            <h2 className="text-[14px] font-semibold text-slate-800">Recent Transactions</h2>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No transactions yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTransactions.map((tx) => {
                const isCredit = tx.type === "CREDIT";
                const initials = tx.account.user.name
                  ? tx.account.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "?";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[13px] font-bold text-slate-600">{initials}</span>
                    </div>

                    {/* Name + note */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-semibold text-slate-800 truncate">
                          {tx.account.user.name}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0",
                            isCredit
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-600"
                          )}
                        >
                          {isCredit ? "CREDIT" : "DEBIT"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.note ?? tx.type.replace("_", " ")}
                      </p>
                      <p className="text-[11px] text-slate-300 truncate">
                        {formatDateTime(tx.createdAt)}
                      </p>
                    </div>

                    {/* Amount + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p
                        className={cn(
                          "text-[13.5px] font-bold tabular-nums",
                          isCredit ? "text-emerald-600" : "text-slate-700"
                        )}
                      >
                        {isCredit ? "+" : "−"}
                        {formatMoney(tx.amount, tx.account.currency)}
                      </p>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
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
