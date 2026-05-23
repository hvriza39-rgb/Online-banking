import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";
import { Settings, ShieldCheck, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Settings — NexaBank" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true, name: true, email: true },
  });

  const kyc = await prisma.kyc.findUnique({
    where:  { userId: session.user.id },
    select: { fullName: true, dateOfBirth: true, address: true, idType: true, idNumber: true },
  });

  const isVerified = user?.kycStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans pb-24">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pt-12 pb-5 border-b border-[#c8dfd5] bg-[#e2f0ea]">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#1e7a52]"
             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            NexaBank
          </p>
          <h1 className="text-[22px] font-semibold text-[#0f2419] tracking-tight mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Settings
          </h1>
        </div>
        <div className="mt-1 w-9 h-9 rounded-full bg-[#f0f7f4] border border-[#c8dfd5] flex items-center justify-center shadow-sm">
          <Settings className="w-4 h-4 text-[#2d5042]" strokeWidth={1.5} />
        </div>
      </div>

      <div className="px-5 pt-5 max-w-lg mx-auto flex flex-col gap-4">

        {/* ── Status banner ── */}
        {isVerified ? (
          <div className="flex items-center gap-3 bg-[#edf7f5] border border-[#a8dbd4] rounded-2xl px-4 py-3">
            <ShieldCheck className="w-4 h-4 text-[#0f7a6e] flex-shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-[#0f7a6e]">Identity Verified</p>
              <p className="text-[11px] text-[#2d5042] mt-0.5">
                Personal details are locked. You can only update your password.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[#fff8ec] border border-[#f0d9a0] rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-[#c47a00] flex-shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-[#c47a00]">Unverified Account</p>
              <p className="text-[11px] text-[#7a5c00] mt-0.5">
                Update your details before submitting KYC verification.
              </p>
            </div>
          </div>
        )}

        {/* ── Settings form ── */}
        <SettingsForm
          isVerified={isVerified}
          user={{
            name:  user?.name  ?? "",
            email: user?.email ?? "",
          }}
          kyc={kyc ? {
            fullName:    kyc.fullName,
            dateOfBirth: kyc.dateOfBirth.toISOString().split("T")[0],
            address:     kyc.address,
            idType:      kyc.idType,
            idNumber:    kyc.idNumber,
          } : null}
        />

      </div>
    </div>
  );
}
