import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { FundForm } from "@/components/fund-form";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { TransactionType } from "@prisma/client";

export const metadata: Metadata = { title: "Admin — User Detail" };

const TX_CONFIG: Record<TransactionType, { label: string; icon: React.ElementType; color: string; sign: string }> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, color: "text-green-600 bg-green-50", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  color: "text-red-500 bg-red-50",     sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  color: "text-red-500 bg-red-50",     sign: "−" },
};

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where:   { id: params.id },
    include: {
      account: {
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 20 },
        },
      },
    },
  });

  if (!user || user.role === "ADMIN") notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg flex-shrink-0">
          {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Balance */}
      {user.account && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <p className="text-sm text-blue-100 mb-1">Current Balance</p>
          <p className="text-3xl font-semibold tracking-tight money">
            {formatMoney(user.account.balance, user.account.currency)}
          </p>
          <p className="text-sm text-blue-200 mt-1">{user.account.currency} Account</p>
        </div>
      )}

      {/* Fund form */}
      {user.account && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Adjust Balance</h2>
          <FundForm
            userId={user.id}
            currency={user.account.currency}
            currentBalance={user.account.balance / 100}
          />
        </div>
      )}

      {/* Transaction history */}
      {user.account && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Transaction History</h2>
          </div>
          {user.account.transactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No transactions yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {user.account.transactions.map((tx) => {
                const cfg  = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
                      <p className="text-xs text-gray-400">{tx.note ?? "—"} · {formatDateTime(tx.createdAt)}</p>
                    </div>
                    <p className={cn("text-sm font-semibold money flex-shrink-0", tx.type === "CREDIT" ? "text-green-600" : "text-gray-800")}>
                      {cfg.sign}{formatMoney(tx.amount, user.account!.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
