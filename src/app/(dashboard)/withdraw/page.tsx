import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WithdrawForm } from "@/components/withdraw-form";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WithdrawalStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Withdraw" };

const STATUS_CONFIG: Record<WithdrawalStatus, { label: string; icon: React.ElementType; class: string }> = {
  PENDING:  { label: "Pending",  icon: Clock,         class: "bg-amber-50 text-amber-700 border-amber-100" },
  APPROVED: { label: "Approved", icon: CheckCircle2,  class: "bg-green-50 text-green-700 border-green-100" },
  REJECTED: { label: "Rejected", icon: XCircle,       class: "bg-red-50 text-red-600 border-red-100" },
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
    take:    10,
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Withdraw Funds</h1>
        <p className="text-sm text-gray-500 mt-0.5">Request a withdrawal — admin will review and approve</p>
      </div>

      {/* Request form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="mb-5 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Available balance</p>
          <p className="text-2xl font-semibold text-gray-900 money mt-0.5">
            {formatMoney(account.balance, account.currency)}
          </p>
        </div>
        <WithdrawForm
          maxAmount={account.balance / 100}
          currency={account.currency}
          hasPending={hasPending}
        />
      </div>

      {/* History */}
      {requests.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Request History</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {requests.map((r) => {
              const cfg  = STATUS_CONFIG[r.status];
              const Icon = cfg.icon;
              return (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 money">
                      {formatMoney(r.amount, r.currency)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(r.createdAt)}</p>
                    {r.adminNote && (
                      <p className="text-xs text-gray-500 mt-0.5 italic">{r.adminNote}</p>
                    )}
                  </div>
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", cfg.class)}>
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
