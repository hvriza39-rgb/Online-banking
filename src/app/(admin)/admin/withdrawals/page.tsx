import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { WithdrawalActions } from "@/components/withdrawal-actions";
import { WithdrawalCodeForm } from "@/components/withdrawal-code-form";
import { Clock, CheckCircle2, XCircle, InboxIcon, ShieldAlert, KeyRound } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Withdrawals" };

export default async function AdminWithdrawalsPage() {
  const [pending, pendingVerification, processed, users] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where:   { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.withdrawalRequest.findMany({
      where:   { status: "PENDING_VERIFICATION" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.withdrawalRequest.findMany({
      where:   { status: { in: ["APPROVED", "REJECTED"] } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      take:    20,
    }),
    prisma.user.findMany({
      where:   { role: "USER" },
      select:  { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const RequestCard = ({
    r,
    badge,
  }: {
    r: (typeof pending)[number];
    badge?: React.ReactNode;
  }) => (
    <div key={r.id} className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13.5px] font-semibold text-slate-900">{r.user.name}</p>
            {badge}
          </div>
          <p className="text-[12px] text-slate-400 mt-0.5">{r.user.email}</p>
          {r.note && (
            <p className="text-[12px] text-slate-500 italic mt-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              "{r.note}"
            </p>
          )}
          <p className="text-[11px] text-slate-400 mt-2">{formatDateTime(r.createdAt)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-slate-900 money">
            {formatMoney(r.amount, r.currency)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{r.currency}</p>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <WithdrawalActions requestId={r.id} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-slate-900">Withdrawal Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Review and action pending requests</p>
        </div>

        {/* Pending Verification section */}
        {pendingVerification.length > 0 && (
          <div className="mb-7 fade-up delay-1">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">
                Awaiting Verification
              </h2>
              <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {pendingVerification.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingVerification.map((r) => (
                <RequestCard
                  key={r.id}
                  r={r}
                  badge={
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                      <ShieldAlert className="w-2.5 h-2.5" />
                      No Code
                    </span>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Pending section */}
        <div className="mb-7 fade-up delay-1">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">
              Pending
            </h2>
            {pending.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="card py-14 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <InboxIcon className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">All clear</p>
              <p className="text-xs text-slate-400 mt-1">No pending withdrawal requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((r) => (
                <RequestCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>

        {/* Verification Code Generator */}
        <div className="mb-7 fade-up delay-2">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-4 h-4 text-slate-500" />
            <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">
              Withdrawal Code Generator
            </h2>
          </div>
          <div className="card p-5">
            <p className="text-[12px] text-slate-500 mb-4">
              Generate a unique security code for a user. They must enter this code when submitting a withdrawal for it to be processed immediately.
            </p>
            <WithdrawalCodeForm users={users} />
          </div>
        </div>

        {/* Processed section */}
        {processed.length > 0 && (
          <div className="fade-up delay-3">
            <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Recently Processed
            </h2>
            <div className="card divide-y divide-slate-50">
              {processed.map((r) => {
                const isApproved = r.status === "APPROVED";
                const Icon = isApproved ? CheckCircle2 : XCircle;
                return (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                      isApproved ? "bg-emerald-50" : "bg-rose-50"
                    )}>
                      <Icon className={cn("w-4 h-4", isApproved ? "text-emerald-600" : "text-rose-500")} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-800">{r.user.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(r.updatedAt)}</p>
                      {r.adminNote && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">"{r.adminNote}"</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-semibold text-slate-800 money">{formatMoney(r.amount, r.currency)}</p>
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block",
                        isApproved ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
                      )}>
                        {r.status}
                      </span>
                    </div>
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
