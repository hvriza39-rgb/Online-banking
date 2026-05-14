import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ClipboardList } from "lucide-react";
import { TransactionType } from "@prisma/client";

export const metadata: Metadata = { title: "Transactions" };

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; chipBg: string; chipText: string; sign: string;
}> = {
  CREDIT: {
    label: "Credit", icon: ArrowDownLeft,
    bg: "bg-emerald-50", text: "text-emerald-600",
    chipBg: "bg-emerald-50 border border-emerald-100", chipText: "text-emerald-700",
    sign: "+",
  },
  DEBIT: {
    label: "Debit", icon: ArrowUpRight,
    bg: "bg-rose-50", text: "text-rose-500",
    chipBg: "bg-rose-50 border border-rose-100", chipText: "text-rose-600",
    sign: "−",
  },
  WITHDRAWAL: {
    label: "Withdrawal", icon: ArrowUpRight,
    bg: "bg-rose-50", text: "text-rose-500",
    chipBg: "bg-rose-50 border border-rose-100", chipText: "text-rose-600",
    sign: "−",
  },
};

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });

  if (!account) redirect("/login");

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">
            {account.transactions.length} transaction{account.transactions.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 mb-5 flex-wrap fade-up delay-1">
          {[
            {
              label: "Total In",
              value: account.transactions.filter((t) => t.type === "CREDIT").reduce((s, t) => s + t.amount, 0),
              className: "bg-emerald-50 border border-emerald-100 text-emerald-700",
            },
            {
              label: "Total Out",
              value: account.transactions.filter((t) => t.type !== "CREDIT").reduce((s, t) => s + t.amount, 0),
              className: "bg-rose-50 border border-rose-100 text-rose-700",
            },
          ].map((s) => (
            <div key={s.label} className={cn("px-4 py-2 rounded-xl text-sm font-medium money", s.className)}>
              {s.label}: {formatMoney(s.value, account.currency)}
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card fade-up delay-2">
          {account.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <ClipboardList className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
              <p className="text-slate-400 text-xs mt-1">Your history will appear here once activity starts</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-[44px_1fr_130px_110px] gap-4 px-6 py-3 border-b border-slate-100">
                {["", "Details", "Date", "Amount"].map((h) => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</span>
                ))}
              </div>

              <div className="divide-y divide-slate-50">
                {account.transactions.map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id}
                      className="grid grid-cols-[44px_1fr_130px_110px] gap-4 items-center px-6 py-4 hover:bg-slate-50/60 transition-colors">
                      {/* Icon */}
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", cfg.bg)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cfg.chipBg, cfg.chipText)}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-400 truncate">
                          {tx.note ?? "No description"}
                        </p>
                        <p className="text-[11px] text-slate-300 mt-0.5 money">
                          After: {formatMoney(tx.balanceAfter, account.currency)}
                        </p>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-[12px] text-slate-500">{formatDateTime(tx.createdAt)}</p>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className={cn(
                          "text-[14px] font-semibold money",
                          tx.type === "CREDIT" ? "text-emerald-600" : "text-slate-700"
                        )}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
