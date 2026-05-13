import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { TransactionType } from "@prisma/client";

export const metadata: Metadata = { title: "Transactions" };

const TX_CONFIG: Record<TransactionType, { label: string; icon: React.ElementType; color: string; sign: string }> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, color: "text-green-600 bg-green-50", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  color: "text-red-500 bg-red-50",     sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  color: "text-red-500 bg-red-50",     sign: "−" },
};

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({
    where: { userId: session.user.id },
    include: {
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!account) redirect("/login");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your full transaction history</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        {account.transactions.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No transactions yet</div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-gray-50 text-xs text-gray-400 font-medium grid grid-cols-[auto_1fr_auto] gap-4">
              <span>Type</span>
              <span>Details</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="divide-y divide-gray-50">
              {account.transactions.map((tx) => {
                const cfg  = TX_CONFIG[tx.type];
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-5 py-4">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", cfg.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {tx.note ?? "—"} · {formatDateTime(tx.createdAt)}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5 money">
                        Balance after: {formatMoney(tx.balanceAfter, account.currency)}
                      </p>
                    </div>
                    <p className={cn("text-sm font-semibold money whitespace-nowrap", tx.type === "CREDIT" ? "text-green-600" : "text-gray-800")}>
                      {cfg.sign}{formatMoney(tx.amount, account.currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
