import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WithdrawForm } from "@/components/withdraw-form";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, Info } from "lucide-react";
import { WithdrawalStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Withdraw" };

const STATUS_CONFIG: Record<WithdrawalStatus, {
  label: string; icon: React.ElementType;
  bg: string; border: string; text: string;
}> = {
  PENDING:  { label: "Pending",  icon: Clock,        bg: "bg-amber-50",  border: "border-amber-100", text: "text-amber-700" },
  APPROVED: { label: "Approved", icon: CheckCircle2, bg: "bg-emerald-50",border: "border-emerald-100",text: "text-emerald-700" },
  REJECTED: { label: "Rejected", icon: XCircle,      bg: "bg-rose-50",   border: "border-rose-100",  text: "text-rose-600" },
};

export default async function WithdrawPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({ where: { userId: session.user.id } });
  if (!account) redirect("/login");

  const hasPending = !!(await prisma.withdrawalRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  }));

  const requests = await prisma.withdrawalRequest.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-slate-900">Withdraw Funds</h1>
          <p className="text-slate-400 text-sm mt-1">Submit a request — admin will review and approve</p>
        </div>

        {/* Balance display */}
        <div className="fade-up delay-1 mb-5 rounded-2xl p-5 border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">Available Balance</p>
          <p className="text-3xl font-semibold text-blue-900 money tracking-tight">
            {formatMoney(account.balance, account.currency)}
          </p>
          <p className="text-xs text-blue-400 mt-1">{account.currency} Account</p>
        </div>

        {/* Info banner */}
        <div className="fade-up delay-2 flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-5">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Withdrawal requests are reviewed by an admin. You can only have one pending request at a time.
            Once approved, funds will be deducted from your account.
          </p>
        </div>

        {/* Form card */}
        <div className="card p-6 fade-up delay-2">
          <h2 className="text-[14px] font-semibold text-slate-800 mb-5">New Request</h2>
          <WithdrawForm
            maxAmount={account.balance / 100}
            currency={account.currency}
            hasPending={hasPending}
          />
        </div>

        {/* Request history */}
        {requests.length > 0 && (
          <div className="card mt-5 fade-up delay-3">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-semibold text-slate-800">Request History</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {requests.map((r) => {
                const cfg  = STATUS_CONFIG[r.status];
                const Icon = cfg.icon;
                return (
                  <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border", cfg.bg, cfg.border)}>
                      <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 money">
                        {formatMoney(r.amount, r.currency)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(r.createdAt)}</p>
                      {r.adminNote && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">"{r.adminNote}"</p>
                      )}
                    </div>
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", cfg.bg, cfg.border, cfg.text)}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
