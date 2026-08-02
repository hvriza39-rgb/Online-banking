import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { WithdrawForm } from "@/components/withdraw-form";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  Send,
} from "lucide-react";
import { WithdrawalStatus } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = { title: "Send Funds — NexaBank" };

const STATUS_CONFIG: Record<
  WithdrawalStatus,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    border: string;
    text: string;
    dot: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  PENDING_VERIFICATION: {
    label: "Awaiting Verification",
    icon: ShieldAlert,
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    dot: "bg-rose-500",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    dot: "bg-rose-500",
  },
};

export default async function WithdrawPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const account = await prisma.account.findUnique({
    where: { userId: session.user.id },
  });
  if (!account) redirect("/login");

  const activePending = await prisma.withdrawalRequest.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING", "PENDING_VERIFICATION"] },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingStatus = (activePending?.status ?? null) as
    | "PENDING"
    | "PENDING_VERIFICATION"
    | null;
  const pendingRequestId = activePending?.id ?? null;

  const requests = await prisma.withdrawalRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const initials = session.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalSent = requests
    .filter((r) => r.status === "APPROVED")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans pb-24">
      {/* ── Sticky top bar ─────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#f0f7f4]/80 backdrop-blur-md border-b border-[#c8dfd5]/60">
        <div className="max-w-lg mx-auto lg:max-w-2xl px-5 h-14 flex items-center gap-3">
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
              Send Funds
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

      <div className="max-w-lg mx-auto lg:max-w-2xl px-5 pt-5 pb-10 flex flex-col gap-5">
        {/* ── Balance Hero ─────────────────────────── */}
        <div className="relative rounded-[20px] p-6 overflow-hidden border border-[#1a6648]/30 shadow-lg bg-gradient-to-br from-[#1a6648] to-[#0f3d28]">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/60 mb-2">
                Available to Send
              </p>
              <p className="font-mono text-[34px] font-bold text-white leading-none tracking-tight tabular-nums">
                {formatMoney(account.balance, account.currency)}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
                  <Wallet className="w-3 h-3 text-white/70" />
                  <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-white/70">
                    {account.currency}
                  </span>
                </span>
                {totalSent > 0 && (
                  <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
                    <TrendingDown className="w-3 h-3 text-white/70" />
                    <span className="text-[9px] font-semibold text-white/70">
                      {formatMoney(totalSent, account.currency)} sent
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Send className="w-6 h-6 text-white/80" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* ── Form Card ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f0f7f4] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#6a8c7a]">
                NexaBank
              </p>
              <h2
                className="text-[15px] font-bold text-[#0f2419] mt-0.5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {pendingStatus === "PENDING_VERIFICATION"
                  ? "Complete Your Transfer"
                  : "New Transfer"}
              </h2>
            </div>
            {pendingStatus && (
              <span
                className={cn(
                  "text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border",
                  STATUS_CONFIG[pendingStatus].bg,
                  STATUS_CONFIG[pendingStatus].border,
                  STATUS_CONFIG[pendingStatus].text
                )}
              >
                {STATUS_CONFIG[pendingStatus].label}
              </span>
            )}
          </div>
          <div className="p-5">
            <WithdrawForm
              maxAmount={account.balance / 100}
              currency={account.currency}
              pendingStatus={pendingStatus}
              pendingRequestId={pendingRequestId}
            />
          </div>
        </div>

        {/* ── Transfer History ─────────────────────── */}
        {requests.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f0f7f4] flex items-center justify-between">
              <h2
                className="text-[15px] font-bold text-[#0f2419]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Recent Transfers
              </h2>
              <span className="text-[10px] text-[#6a8c7a] font-medium">
                {requests.length} total
              </span>
            </div>

            <div>
              {requests.map((r, i) => {
                const cfg = STATUS_CONFIG[r.status];
                const Icon = cfg.icon;
                const isApproved = r.status === "APPROVED";

                return (
                  <div
                    key={r.id}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 hover:bg-[#f6faf8] transition-colors",
                      i !== requests.length - 1 && "border-b border-[#f6faf8]"
                    )}
                  >
                    {/* Status icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                        cfg.bg,
                        cfg.border
                      )}
                    >
                      <Icon
                        className={cn("w-4 h-4", cfg.text)}
                        strokeWidth={2.5}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-[#0f2419]">
                          {r.note || "Transfer"}
                        </p>
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            cfg.dot
                          )}
                        />
                      </div>
                      <p className="text-[10px] text-[#6a8c7a] font-mono tracking-[0.04em] mt-0.5">
                        {formatDateTime(r.createdAt)}
                      </p>
                    </div>

                    {/* Amount + status */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={cn(
                          "text-[14px] font-bold font-mono",
                          isApproved ? "text-rose-600" : "text-[#0f2419]"
                        )}
                      >
                        −{formatMoney(r.amount, r.currency)}
                      </p>
                      <span
                        className={cn(
                          "inline-block mt-1 text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border",
                          cfg.bg,
                          cfg.border,
                          cfg.text
                        )}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────── */}
        {requests.length === 0 && !pendingStatus && (
          <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#f0f7f4] border border-[#c8dfd5] flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-[#6a8c7a]" />
            </div>
            <h3
              className="text-[15px] font-bold text-[#0f2419] mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              No transfers yet
            </h3>
            <p className="text-[12px] text-[#6a8c7a] max-w-[240px] mx-auto leading-relaxed">
              Send money to any account locally or internationally. Your transfer
              history will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
