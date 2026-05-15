import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KycForm } from "@/components/kyc-form";
import { ShieldCheck, FileText, User, MapPin } from "lucide-react";

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
            This takes less than 2 minutes and your account number will be generated instantly.
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
