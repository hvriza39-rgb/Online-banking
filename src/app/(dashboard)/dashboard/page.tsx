import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  ArrowDownLeft, ArrowUpRight, ClipboardList,
  TrendingUp, TrendingDown, ShieldAlert,
  ArrowRight, CreditCard, Wallet,
} from "lucide-react";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = { title: "Account Overview" };

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; sign: string;
}> = {
  CREDIT:     { label: "Credit",  icon: ArrowDownLeft, bg: "bg-[#e6f7f3]", text: "text-[#16a37f]", sign: "+" },
  DEBIT:      { label: "Debit",   icon: ArrowUpRight,  bg: "bg-rose-50",   text: "text-rose-400",  sign: "−" },
  WITHDRAWAL: { label: "Debit",   icon: ArrowUpRight,  bg: "bg-rose-50",   text: "text-rose-400",  sign: "−" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true },
  });

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 6 } },
  });

  if (!account) redirect("/login");

  const isVerified = user?.kycStatus === "VERIFIED";

  const totalCredited = account.transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const totalDebited = account.transactions
    .filter((t) => t.type !== "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  // Donut chart segments (percentages out of 251.2 = full circumference of r=40)
  const total = totalCredited + totalDebited || 1;
  const creditPct = (totalCredited / total) * 251.2;
  const debitPct  = (totalDebited  / total) * 251.2;

  return (
    <div className="min-h-screen bg-[#eef1f8] p-5 sm:p-8 flex flex-col gap-6">

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1a1d27]">
          Account Overview
        </h1>
        <div className="hidden sm:flex items-center gap-2.5 bg-white border border-[#e8ecf4] rounded-full px-4 py-2 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-[#16a37f] flex items-center justify-center text-white text-[11px] font-extrabold flex-shrink-0">
            {session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#1a1d27] leading-none">{session.user.name}</p>
            <p className="text-[11px] text-[#9ca3af] leading-none mt-0.5">Personal</p>
          </div>
        </div>
      </div>

      {/* ── KYC Banner ──────────────────────────────── */}
      {!isVerified && (
        <Link
          href="/kyc"
          className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.995]"
        >
          <div className="w-11 h-11 bg-amber-100 border-2 border-amber-200 rounded-[14px] flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-amber-900">Verify your identity to activate your account</p>
            <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
              Complete KYC verification to get your account number and unlock transfers.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-400 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl flex-shrink-0 shadow-sm shadow-amber-200">
            Verify now <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      )}

      {/* ── Main grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left column: card + actions ───────────── */}
        <div className="lg:col-span-1 flex flex-col gap-3">

          {/* Balance card — compact, near-white */}
          <div className="bg-[#f9fafb] border border-[#e4e7ef] rounded-[18px] p-5 shadow-sm relative overflow-hidden">
            {/* Subtle green tint in corner */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[#16a37f]/[0.06] pointer-events-none" />

            <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-1.5">
              Main Balance
            </p>
            <p className="font-mono text-[36px] font-semibold leading-none tracking-tight text-[#0f1117] mb-4">
              {formatMoney(account.balance, account.currency)}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#1a1d27] leading-none">
                  {session.user.name}
                </p>
                <p className="font-mono text-[12px] text-[#9ca3af] tracking-[0.05em] mt-1">
                  {isVerified && account.accountNumber
                    ? `${account.accountNumber.slice(0, 5)} ${account.accountNumber.slice(5)}`
                    : "— Pending KYC —"}
                </p>
              </div>
              {isVerified ? (
                <span className="text-[10px] font-bold tracking-widest uppercase bg-[#e6f7f3] text-[#16a37f] px-3 py-1.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-full">
                  Unverified
                </span>
              )}
            </div>
          </div>

          {/* Quick actions — outside the card */}
          <div className="grid grid-cols-2 gap-2.5">
            {isVerified ? (
              <Link
                href="/withdraw"
                className="flex items-center justify-center gap-2 bg-white border border-[#e4e7ef] text-[#1a1d27] font-semibold text-[13.5px] py-3 rounded-[13px] shadow-sm hover:bg-[#f9fafb] transition-all active:scale-[0.98]"
              >
                <ArrowUpRight className="w-4 h-4" /> Send
              </Link>
            ) : (
              <span className="flex items-center justify-center gap-2 bg-white border border-[#e4e7ef] text-[#c4c9d4] font-semibold text-[13.5px] py-3 rounded-[13px] cursor-not-allowed select-none">
                <ArrowUpRight className="w-4 h-4" /> Send
              </span>
            )}

            <Link
              href="/transactions"
              className="flex items-center justify-center gap-2 bg-[#16a37f] text-white font-semibold text-[13.5px] py-3 rounded-[13px] shadow-sm shadow-[#16a37f]/20 hover:bg-[#13946f] transition-all active:scale-[0.98]"
            >
              <ClipboardList className="w-4 h-4" /> History
            </Link>
          </div>

          {/* KYC action button (unverified only) */}
          {!isVerified && (
            <Link
              href="/kyc"
              className="flex items-center justify-center gap-2 bg-white border border-amber-200 text-amber-700 font-semibold text-[13.5px] py-3 rounded-[13px] shadow-sm hover:bg-amber-50 transition-all active:scale-[0.98]"
            >
              <ShieldAlert className="w-4 h-4" /> Verify KYC
            </Link>
          )}
        </div>

        {/* ── Center column ─────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#e8ecf4] p-5 shadow-sm">
              <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Credited</p>
              <p className="font-mono text-[22px] font-extrabold text-[#16a37f] tracking-tight leading-none">
                {formatMoney(totalCredited, account.currency)}
              </p>
              <p className="text-[11px] text-[#9ca3af] mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#16a37f]" /> All time
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e8ecf4] p-5 shadow-sm">
              <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Debited</p>
              <p className="font-mono text-[22px] font-extrabold text-[#1a1d27] tracking-tight leading-none">
                {formatMoney(totalDebited, account.currency)}
              </p>
              <p className="text-[11px] text-[#9ca3af] mt-2 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-rose-400" /> All time
              </p>
            </div>
          </div>

          {/* Spending donut */}
          <div className="bg-white rounded-2xl border border-[#e8ecf4] shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
              <p className="text-[14px] font-bold text-[#1a1d27]">Spending Overview</p>
            </div>
            <div className="flex items-center gap-5 p-5">
              <svg width="110" height="110" viewBox="0 0 110 110" className="flex-shrink-0">
                <circle cx="55" cy="55" r="40" fill="none" stroke="#f0f2f7" strokeWidth="18" />
                {totalCredited > 0 && (
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#3b82f6" strokeWidth="18"
                    strokeDasharray={`${creditPct} ${251.2 - creditPct}`}
                    strokeDashoffset="0" strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                  />
                )}
                {totalDebited > 0 && (
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#16a37f" strokeWidth="18"
                    strokeDasharray={`${debitPct} ${251.2 - debitPct}`}
                    strokeDashoffset={`-${creditPct}`} strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                  />
                )}
                {totalCredited === 0 && totalDebited === 0 && (
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#e8ecf4" strokeWidth="18" />
                )}
                <text x="55" y="50" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="700" fill="#1a1d27">
                  {formatMoney(account.balance, account.currency).replace(/\.00$/, "")}
                </text>
                <text x="55" y="63" textAnchor="middle" fontSize="9" fill="#9ca3af">balance</text>
              </svg>

              <div className="flex flex-col gap-3 flex-1">
                {[
                  { color: "#3b82f6", label: "Credits", val: totalCredited },
                  { color: "#16a37f", label: "Debits",  val: totalDebited  },
                ].map(({ color, label, val }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-[12px] text-[#6b7280] font-medium flex-1">{label}</span>
                    <span className="font-mono text-[12px] font-bold text-[#1a1d27]">
                      {formatMoney(val, account.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ──────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Account details */}
          <div className="bg-white rounded-2xl border border-[#e8ecf4] shadow-sm p-5">
            <p className="text-[14px] font-bold text-[#1a1d27] mb-4">Account Details</p>

            <div className="bg-[#f4f6fb] rounded-[13px] p-4 mb-3">
              <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Account Number</p>
              {isVerified && account.accountNumber ? (
                <p className="font-mono text-[17px] font-semibold text-[#1a1d27] tracking-[0.06em]">
                  {account.accountNumber.slice(0, 5)} {account.accountNumber.slice(5)}
                </p>
              ) : (
                <p className="font-mono text-[14px] text-[#9ca3af]">— Pending KYC —</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#f0f4ff] rounded-lg px-3 py-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-[12px] font-bold text-[#3b82f6]">{account.currency}</span>
              </div>
              {isVerified ? (
                <div className="flex items-center gap-1.5 bg-[#e6f7f3] rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a37f]" />
                  <span className="text-[12px] font-bold text-[#16a37f]">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[12px] font-bold text-amber-600">Unverified</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-[#e8ecf4] shadow-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
              <p className="text-[14px] font-bold text-[#1a1d27]">Recent Activity</p>
              <Link href="/transactions" className="text-[12px] font-semibold text-[#16a37f]">View all</Link>
            </div>
            {account.transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <CreditCard className="w-8 h-8 text-[#e8ecf4] mb-3" />
                <p className="text-[13px] font-semibold text-[#9ca3af]">No transactions yet</p>
              </div>
            ) : (
              <div>
                {account.transactions.slice(0, 4).map((tx) => {
                  const cfg  = TX_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#f5f7fb] last:border-0 hover:bg-[#fafbff] transition-colors">
                      <div className={cn("w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0", cfg.bg)}>
                        <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1a1d27]">{cfg.label}</p>
                        <p className="text-[11px] text-[#9ca3af] truncate">{formatDateTime(tx.createdAt)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={cn(
                          "text-[13px] font-bold font-mono",
                          tx.type === "CREDIT" ? "text-[#16a37f]" : "text-[#1a1d27]"
                        )}>
                          {cfg.sign}{formatMoney(tx.amount, account.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Full-width transactions table ──────────── */}
      {account.transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e8ecf4] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f3f8]">
            <p className="text-[15px] font-bold text-[#1a1d27]">All Recent Transactions</p>
            <Link href="/transactions" className="text-[12px] font-semibold text-[#16a37f]">View all →</Link>
          </div>
          <div className="divide-y divide-[#f5f7fb]">
            {account.transactions.map((tx) => {
              const cfg  = TX_CONFIG[tx.type];
              const Icon = cfg.icon;
              return (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafbff] transition-colors">
                  <div className={cn("w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0", cfg.bg)}>
                    <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#1a1d27]">{cfg.label}</p>
                    <p className="text-[11px] text-[#9ca3af]">
                      {tx.note ? tx.note : formatDateTime(tx.createdAt)}
                    </p>
                  </div>
                  <div className="hidden sm:block text-[11px] text-[#9ca3af] font-mono">
                    {formatDateTime(tx.createdAt)}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      "text-[14px] font-bold font-mono",
                      tx.type === "CREDIT" ? "text-[#16a37f]" : "text-[#1a1d27]"
                    )}>
                      {cfg.sign}{formatMoney(tx.amount, account.currency)}
                    </p>
                    <p className="text-[10.5px] text-[#9ca3af] font-mono mt-0.5">
                      Bal: {formatMoney(tx.balanceAfter, account.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
