import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KycForm } from "@/components/kyc-form";
import { ShieldCheck, FileText, User, MapPin, Clock, ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Verify Identity" };

export default async function KycPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true, name: true },
  });

  // Already verified — redirect to dashboard
  if (user?.kycStatus === "VERIFIED") redirect("/dashboard");

  // Already submitted — show pending state instead of the form
  if (user?.kycStatus === "PENDING") {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-10 flex flex-col items-center text-center">

            {/* Pending icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping"
                style={{ animationDuration: "2s" }} />
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-200">
                <Clock className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Verification Pending
            </h1>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
              Your KYC details have been submitted and are currently under review.
              
            </p>

            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 w-full max-w-xs">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-700 text-left">
                Your account number has been reserved. Full access unlocks after approval.
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 fade-up">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Identity Verification Required
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Verify your identity</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            We need to verify who you are before activating your account.
            Submit your details and our system will review your information. 
          
          </p>
        </div>

        {/* Steps overview */}
        <div className="grid grid-cols-3 gap-3 mb-7 fade-up delay-1">
          {[
            { icon: User,        label: "Personal Info",  sub: "Name & date of birth" },
            { icon: MapPin,      label: "Address",        sub: "Your current address" },
            { icon: FileText,    label: "ID Document",    sub: "Passport or national ID" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="card p-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[12px] font-semibold text-slate-700">{label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card p-7 fade-up delay-2">
          <KycForm userName={user?.name ?? ""} />
        </div>

        <p className="text-center text-xs text-slate-400 mt-5 fade-up delay-3">
          🔒 Your information is encrypted and stored securely. We never share your data with third parties.
        </p>
      </div>
    </div>
  );
}
