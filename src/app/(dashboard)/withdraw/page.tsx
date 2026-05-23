import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WithdrawForm } from "@/components/withdraw-form";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { WithdrawalStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Send Funds" };

const STATUS_CONFIG: Record<WithdrawalStatus, {
  label: string; icon: React.ElementType;
  bg: string; border: string; text: string;
}> = {
  PENDING:              { label: "Pending",              icon: Clock,        bg: "bg-[#fff8ec]",  border: "border-[#f0d9a0]", text: "text-[#c47a00]"  },
  PENDING_VERIFICATION: { label: "Awaiting Verification", icon: ShieldAlert,  bg: "bg-[#fdf2f2]",  border: "border-[#f0c0c0]", text: "text-[#b52b3a]"  },
  APPROVED:             { label: "Approved",             icon: CheckCircle2, bg: "bg-[#edf7f5]",  border: "border-[#a8dbd4]", text: "text-[#0f7a6e]"  },
  REJECTED:             { label: "Rejected",             icon: XCircle,      bg: "bg-[#faeef0]",  border: "border-[#e8b8be]", text: "text-[#b52b3a]"  },
};

export default async function WithdrawPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({ where: { userId: session.user.id } });
  if (!account) redirect("/login");

  // Find any active (non-processed) request — we need both status and id
  const activePending = await prisma.withdrawalRequest.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING", "PENDING_VERIFICATION"] },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingStatus    = (activePending?.status ?? null) as "PENDING" | "PENDING_VERIFICATION" | null;
  const pendingRequestId = activePending?.id ?? null;

  const requests = await prisma.withdrawalRequest.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-[#f0f7f4] p-6 lg:p-8">
      <div className="max-w-2xl">

        {/* Header */}
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-[#0f2419] fade-up"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Send Funds
          </h1>
          <p className="text-[#6a8c7a] text-sm mt-1">Transfer funds to a local or international account</p>
        </div>

        {/* Balance display */}
        <div className="fade-up delay-1 mb-5 rounded-2xl p-5 border border-[#c8dfd5] bg-[#f2f9f6]">
          <p className="text-[10px] font-semibold text-[#6a8c7a] uppercase tracking-[0.2em] mb-1">Available Balance</p>
          <p className="text-3xl font-semibold text-[#0f2419] font-mono tracking-tight">
            {formatMoney(account.balance, account.currency)}
          </p>
          <p className="text-xs text-[#6a8c7a] mt-1">{account.currency} Account</p>
        </div>

        {/* Form card */}
        <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm p-6 fade-up delay-2">
          <h2 className="text-[14px] font-semibold text-[#0f2419] mb-5">
            {pendingStatus === "PENDING_VERIFICATION" ? "Complete Your Transfer" : "New Transfer"}
          </h2>
          <WithdrawForm
            maxAmount={account.balance / 100}
            currency={account.currency}
            pendingStatus={pendingStatus}
            pendingRequestId={pendingRequestId}
          />
        </div>

        {/* Request history */}
        {requests.length > 0 && (
          <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm mt-5 fade-up delay-3">
            <div className="px-6 py-4 border-b border-[#d8ede6]">
              <h2 className="text-[14px] font-semibold text-[#0f2419]">Transfer History</h2>
            </div>
            <div className="divide-y divide-[#f0f7f4]">
              {requests.map((r) => {
                const cfg  = STATUS_CONFIG[r.status];
                const Icon = cfg.icon;
                return (
                  <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#e4f2ec] transition-colors">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border", cfg.bg, cfg.border)}>
                      <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#0f2419] font-mono">
                        {formatMoney(r.amount, r.currency)}
                      </p>
                      <p className="text-[11px] text-[#6a8c7a] mt-0.5">{formatDateTime(r.createdAt)}</p>
                      {r.note && (
                        <p className="text-[11px] text-[#2d5042] italic mt-0.5">"{r.note}"</p>
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
