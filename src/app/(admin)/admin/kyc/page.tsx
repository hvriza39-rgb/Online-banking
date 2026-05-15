import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, cn } from "@/lib/utils";
import { KycActions } from "@/components/kyc-actions";
import { ShieldCheck, ShieldAlert, ShieldX, InboxIcon, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Admin — KYC" };

export default async function AdminKycPage() {
  const [pending, processed] = await Promise.all([
    prisma.kyc.findMany({
      where:   { user: { kycStatus: "PENDING" } },
      include: { user: { select: { name: true, email: true, kycStatus: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.kyc.findMany({
      where:   { user: { kycStatus: { in: ["VERIFIED", "REJECTED"] } } },
      include: { user: { select: { name: true, email: true, kycStatus: true } } },
      orderBy: { verifiedAt: "desc" },
      take:    20,
    }),
  ]);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl">

        {/* Header */}
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-slate-900">KYC Verification</h1>
          <p className="text-slate-400 text-sm mt-0.5">Review and approve identity submissions</p>
        </div>

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
              <p className="text-xs text-slate-400 mt-1">No pending KYC submissions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((kyc) => (
                <div key={kyc.id} className="card p-5">
                  {/* User info */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[13.5px] font-semibold text-slate-900">{kyc.user.name}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{kyc.user.email}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Submitted {formatDate(kyc.submittedAt)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-full flex-shrink-0">
                      Pending
                    </span>
                  </div>

                  {/* KYC details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Full Name",     value: kyc.fullName },
                      { label: "Date of Birth", value: formatDate(kyc.dateOfBirth) },
                      { label: "ID Type",       value: kyc.idType.replace("_", " ") },
                      { label: "ID Number",     value: kyc.idNumber },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                        <p className="text-[13px] font-medium text-slate-800 font-mono">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Address — full width */}
                  <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Address</p>
                    <p className="text-[13px] font-medium text-slate-800">{kyc.address}</p>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 pt-4">
                    <KycActions kycId={kyc.id} userId={kyc.userId} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed section */}
        {processed.length > 0 && (
          <div className="fade-up delay-2">
            <h2 className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Recently Processed
            </h2>
            <div className="card divide-y divide-slate-50">
              {processed.map((kyc) => {
                const isVerified = kyc.user.kycStatus === "VERIFIED";
                const Icon = isVerified ? ShieldCheck : ShieldX;
                return (
                  <div key={kyc.id} className="flex items-center gap-4 px-5 py-4">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                      isVerified ? "bg-emerald-50" : "bg-rose-50"
                    )}>
                      <Icon className={cn("w-4 h-4", isVerified ? "text-emerald-600" : "text-rose-500")} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-800">{kyc.user.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{kyc.user.email}</p>
                      {kyc.verifiedAt && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(kyc.verifiedAt)}</p>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full flex-shrink-0",
                      isVerified
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-600"
                    )}>
                      {kyc.user.kycStatus}
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
