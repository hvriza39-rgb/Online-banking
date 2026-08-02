import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, cn } from "@/lib/utils";
import { ClipboardList, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { TransactionList } from "@/components/transaction-list";
import Link from "next/link";

export const metadata: Metadata = { title: "Transactions — NexaBank" };

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" } } },
  });

  if (!account) redirect("/login");

  const initials = session.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalIn = account.transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s: bigint, t) => s + BigInt(t.amount), BigInt(0));

  const totalOut = account.transactions
    .filter((t) => t.type !== "CREDIT")
    .reduce((s: bigint, t) => s + BigInt(t.amount), BigInt(0));

  const txCount = account.transactions.length;

  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans pb-24">
      {/* ── Sticky top bar ─────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#f0f7f4]/80 backdrop-blur-md border-b border-[#c8dfd5]/60">
        <div className="max-w-lg mx-auto lg:max-w-4xl px-5 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl bg-white border border-[#c8dfd5] flex items-center justify-center shadow-sm hover:shadow-md hover:border-[#4daa80] transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#2d5042]" strokeWidth={2} />
          </Link>
          <div className="flex-1">
            <h1
              className="text-[17px] font-bold text-[#0f2419]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Transactions
            </h1>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #1a6648, #3daa7a)",
            }}
          >
            <span className="text-[11px] font-semibold text-white">
              {initials}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto lg:max-w-4xl px-5 pt-5 pb-10 flex flex-col gap-5">
        {/* ── Summary cards ────────────────────────── */}
        {txCount > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total In
                </span>
              </div>
              <p className="text-[18px] font-bold font-mono text-emerald-700 tabular-nums">
                {formatMoney(totalIn, account.currency)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {account.transactions.filter((t) => t.type === "CREDIT").length} credits
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Out
                </span>
              </div>
              <p className="text-[18px] font-bold font-mono text-rose-600 tabular-nums">
                {formatMoney(totalOut, account.currency)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {account.transactions.filter((t) => t.type !== "CREDIT").length} debits
              </p>
            </div>
          </div>
        )}

        {/* ── Transaction list ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
          {txCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-[15px] font-bold text-slate-900 mb-1">
                No transactions yet
              </p>
              <p className="text-[13px] text-slate-400 max-w-[260px] leading-relaxed">
                Your transaction history will appear here once you start sending or receiving funds.
              </p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden sm:grid grid-cols-[52px_1fr_140px_120px_32px] gap-4 px-6 py-3 border-b border-slate-100">
                <span />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Details
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Date
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 text-right">
                  Amount
                </span>
                <span />
              </div>

              <TransactionList
                transactions={account.transactions}
                currency={account.currency}
              />
            </>
          )}
        </div>

        {/* ── Footer count ─────────────────────────── */}
        {txCount > 0 && (
          <p className="text-center text-[11px] text-slate-400 font-medium">
            Showing all {txCount} transaction{txCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
