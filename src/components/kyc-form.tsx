"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { kycSchema, type KycInput } from "@/lib/kyc-validator";
import {
  Loader2, AlertCircle, CheckCircle2,
  User, Calendar, MapPin, FileText, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KycSuccess } from "@/components/kyc-success";

const ID_TYPE_OPTIONS = [
  { value: "PASSPORT",        label: "🛂 Passport" },
  { value: "NATIONAL_ID",     label: "🪪 National ID Card" },
  { value: "DRIVERS_LICENSE", label: "🚗 Driver's License" },
];

interface KycFormProps {
  userName: string;
}

export function KycForm({ userName }: KycFormProps) {
  const router = useRouter();
  const [step, setStep]                   = useState<"form" | "loading" | "success">("form");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [serverError, setServerError]     = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KycInput>({ resolver: zodResolver(kycSchema) });

  const onSubmit = async (data: KycInput) => {
    setServerError(null);
    setStep("loading");

    // Artificial delay so the loading animation has time to breathe
    const [res] = await Promise.all([
      fetch("/api/kyc", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      }),
      new Promise((resolve) => setTimeout(resolve, 3500)),
    ]);

    const json = await res.json();

    if (!res.ok) {
      setStep("form");
      setServerError(json.error ?? "Submission failed. Please try again.");
      return;
    }

    setAccountNumber(json.accountNumber);
    setStep("success");
  };

  // ── Loading screen ──────────────────────────────────────
  if (step === "loading") {
    return <KycLoadingScreen />;
  }

  // ── Success / pending screen ────────────────────────────
  if (step === "success") {
    return <KycSuccess accountNumber={accountNumber} onContinue={() => router.push("/dashboard")} />;
  }

  // ── Form ────────────────────────────────────────────────
  const inputClass = (hasError: boolean) =>
    cn(
      "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
      "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white",
      hasError ? "border-rose-300 bg-rose-50" : "border-slate-200"
    );

  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Section 1: Personal ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700">Personal Information</span>
        </div>

        <div className="space-y-4">
          {/* Full name */}
          <div>
            <label className={labelClass}>Full Legal Name</label>
            <input
              {...register("fullName")}
              placeholder="As it appears on your ID"
              defaultValue={userName}
              className={inputClass(!!errors.fullName)}
            />
            {errors.fullName && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.fullName.message}
              </p>
            )}
          </div>

          {/* Date of birth */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Date of Birth
              </span>
            </label>
            <input
              {...register("dateOfBirth")}
              type="date"
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split("T")[0]}
              className={inputClass(!!errors.dateOfBirth)}
            />
            {errors.dateOfBirth && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.dateOfBirth.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2: Address ───────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700">Residential Address</span>
        </div>

        <div>
          <label className={labelClass}>Full Address</label>
          <textarea
            {...register("address")}
            rows={3}
            placeholder="House number, street, city, state, zip code"
            className={cn(inputClass(!!errors.address), "resize-none")}
          />
          {errors.address && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.address.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Section 3: ID Document ───────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700">Identity Document</span>
        </div>

        <div className="space-y-4">
          {/* ID Type */}
          <div>
            <label className={labelClass}>ID Type</label>
            <div className="grid grid-cols-1 gap-2">
              {ID_TYPE_OPTIONS.map((opt) => (
                <label key={opt.value}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    {...register("idType")}
                    type="radio"
                    value={opt.value}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.idType && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.idType.message}
              </p>
            )}
          </div>

          {/* ID Number */}
          <div>
            <label className={labelClass}>ID Number</label>
            <input
              {...register("idNumber")}
              placeholder="e.g. P123456789"
              className={cn(inputClass(!!errors.idNumber), "font-mono tracking-wider uppercase")}
            />
            {errors.idNumber && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.idNumber.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-200"
      >
        {isSubmitting
          ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
          : <><ChevronRight className="w-4 h-4" />Submit for Verification</>
        }
      </button>
    </form>
  );
}

// ── Loading animation component ───────────────────────────
function KycLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      {/* Logo with pulsing ring */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
        <div className="absolute inset-[-8px] rounded-full border-2 border-blue-200/60 animate-spin"
          style={{ animationDuration: "3s" }} />
        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-300/40">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-white fill-none stroke-current stroke-2">
            <rect x="2" y="5" width="20" height="14" rx="3" />
            <path d="M2 10h20" />
            <path d="M6 15h4" strokeLinecap="round" />
            <circle cx="17" cy="15" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </div>

      {/* Animated dots loader */}
      <div className="flex items-center gap-1.5 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-500"
            style={{
              animation: "bounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Generating your account number
      </h2>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
        We're processing your details and reserving your account number.
      </p>

      {/* Progress steps */}
      <div className="mt-8 space-y-2 w-full max-w-xs text-left">
        {[
          "Validating submitted details…",
          "Running security checks…",
          "Generating account number…",
        ].map((label, i) => (
          <div
            key={label}
            className="flex items-center gap-3 text-sm text-slate-500"
            style={{
              animation: "fadeIn 0.4s ease forwards",
              animationDelay: `${0.6 + i * 0.8}s`,
              opacity: 0,
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {label}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
