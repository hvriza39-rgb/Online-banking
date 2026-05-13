import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { WithdrawalActions } from "@/components/withdrawal-actions";
import { Clock } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Withdrawals" };

export default async function AdminWithdrawalsPage() {
  const [pending, processed] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where:   { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" }, // oldest first
    }),
    prisma.withdrawalRequest.findMany({
      where:   { status: { in: ["APPROVED", "REJECTED"] } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      take:    20,
    }),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Withdrawal Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and action pending requests</p>
      </div>

      {/* Pending */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-sm text-gray-400">
            No pending requests
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.user.name}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                    {r.note && <p className="text-xs text-gray-500 mt-1 italic">"{r.note}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(r.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-gray-900 money">
                      {formatMoney(r.amount, r.currency)}
                    </p>
                    <p className="text-xs text-gray-400">{r.currency}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <WithdrawalActions requestId={r.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed */}
      {processed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Processed</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {processed.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{r.user.name}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(r.updatedAt)}</p>
                  {r.adminNote && <p className="text-xs text-gray-500 italic mt-0.5">{r.adminNote}</p>}
                </div>
                <p className="text-sm font-semibold text-gray-800 money flex-shrink-0">
                  {formatMoney(r.amount, r.currency)}
                </p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                  r.status === "APPROVED"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
