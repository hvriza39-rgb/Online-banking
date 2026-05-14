import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KycForm } from "@/components/kyc-form";
import { ShieldCheck, Clock, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Identity Verification" };

export default async function KycPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { kycSubmission: true },
  });

  if (!user) redirect("/login");

  const kycStatus = user.kycStatus;

  if (kycStatus === "APPROVED") {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-9 h-9 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111318] mb-2">Identity Verified</h1>
          <p className="text-[#9aa0b0] text-sm">Your identity has been successfully verified. Your account is fully active.</p>
        </div>
      </div>
    );
  }

  if (kycStatus === "PENDING") {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-9 h-9 text-amber-500" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111318] mb-2">Under Review</h1>
          <p className="text-[#9aa0b0] text-sm">Your documents have been submitted and are being reviewed by our team.</p>
        </div>
      </div>
    );
  }

  if (kycStatus === "REJECTED") {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-2xl">
          <div className="mb-7 fade-up">
            <h1 className="text-2xl font-semibold text-[#111318]">Identity Verification</h1>
            <p className="text-[#9aa0b0] text-sm mt-1">Your previous submission was rejected. Please resubmit.</p>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 mb-5">
            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700">Your previous KYC submission was rejected. Please review your information and try again.</p>
          </div>
          <KycForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-2xl">
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-[#111318]">Identity Verification</h1>
          <p className="text-[#9aa0b0] text-sm mt-1">Complete KYC to activate your account and receive your account number</p>
        </div>
        <KycForm />
      </div>
    </div>
  );
}
