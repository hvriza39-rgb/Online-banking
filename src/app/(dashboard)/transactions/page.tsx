import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import { TransactionList } from "@/components/transaction-list";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });

  if (!account) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f0f7f4] p-6 lg:p-8">
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-[#0f2419]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Transactions
          </h1>
          <p className="text-[#6a8c7a] text-sm mt-1">
            {account.transactions.length} transaction{account.transactions.length !== 1 ? "s" : ""} total
          </p>
        </div>
{/* Summary chips */}
<div className="flex gap-3 mb-5 flex-wrap fade-up delay-1">
  {[
    {
      label: "Total In",
      value: account.transactions
        .filter((t) => t.type === "CREDIT")
        .reduce((s: bigint, t) => s + BigInt(t.amount), BigInt(0)),
      className: "bg-[#edf7f5] border border-[#a8dbd4] text-[#0f7a6e]",
    },
    {
      label: "Total Out",
      value: account.transactions
        .filter((t) => t.type !== "CREDIT")
        .reduce((s: bigint, t) => s + BigInt(t.amount), BigInt(0)),
      className: "bg-[#faeef0] border border-[#e8b8be] text-[#b52b3a]",
    },
  ].map((s) => (
    <div key={s.label} className={cn("px-4 py-2 rounded-xl text-sm font-medium font-mono", s.className)}>
      {s.label}: {formatMoney(s.value, account.currency)}
    </div>
  ))}
</div>
        

        {/* Table */}
        <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden fade-up delay-2">
          {account.transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center mb-4">
                <ClipboardList className="w-7 h-7 text-[#a8c8b8]" />
              </div>
              <p className="text-[#6a8c7a] text-sm font-medium">No transactions yet</p>
              <p className="text-[#a8c8b8] text-xs mt-1">Your history will appear here once activity starts</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-[44px_1fr_130px_110px] gap-4 px-6 py-3 border-b border-[#d8ede6]">
                {["", "Details", "Date", "Amount"].map((h) => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-[#6a8c7a]">{h}</span>
                ))}
              </div>

              <TransactionList
                transactions={account.transactions}
                currency={account.currency}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
