"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TermsModal from "@/components/TermsModal";

export function RegisterForm() {
  const router                          = useRouter();
  const [showPw, setShowPw]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const res  = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Registration failed. Please try again."); return; }
    router.push("/login?registered=1");
  };

  const inputBase = (hasError: boolean) => cn(
    "w-full px-3.5 py-3 rounded-xl text-[14px] text-[#0f2419] outline-none transition-all",
    "bg-[#f2f9f6] border placeholder:text-[#a8c8b8]",
    "focus:bg-white focus:border-[#1e7a52] focus:shadow-[0_0_0_3px_rgba(30,122,82,0.1)]",
    hasError
      ? "border-[#c0392b] bg-[#fdf3f2] focus:border-[#c0392b] focus:shadow-[0_0_0_3px_rgba(192,57,43,0.08)]"
      : "border-[#c8dfd5]"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Full name */}
      <div>
        <label className="block text-[13px] font-semibold text-[#2d5042] mb-1.5">Full name</label>
        <input
          {...register("name")}
          placeholder="John Doe"
          className={inputBase(!!errors.name)}
        />
        {errors.name && (
          <p className="mt-1.5 text-[12px] text-[#c0392b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-[13px] font-semibold text-[#2d5042] mb-1.5">Email address</label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          className={inputBase(!!errors.email)}
        />
        {errors.email && (
          <p className="mt-1.5 text-[12px] text-[#c0392b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.email.message}
          </p>
        )}
      </div>

      {/* Currency */}
      <div>
        <label className="block text-[13px] font-semibold text-[#2d5042] mb-1.5">Account currency</label>
        <select
          {...register("currency")}
          className={cn(inputBase(!!errors.currency), "cursor-pointer appearance-auto")}
        >
          <option value="" disabled>Select your currency</option>
          <option value="USD">🇺🇸  USD — US Dollar</option>
          <option value="EUR">🇪🇺  EUR — Euro</option>
        </select>
        {errors.currency && (
          <p className="mt-1.5 text-[12px] text-[#c0392b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.currency.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-[13px] font-semibold text-[#2d5042] mb-1.5">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            className={cn(inputBase(!!errors.password), "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8c8b8] hover:text-[#2d5042] transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="mt-1.5 text-[12px] text-[#c0392b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.password.message}
          </p>
        ) : (
          <p className="mt-1.5 text-[12px] text-[#6a8c7a]">
            At least 8 characters, one uppercase letter, one number.
          </p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className="w-4 h-4 rounded border-[#c8dfd5] accent-[#1e7a52] flex-shrink-0 cursor-pointer mt-0.5"
        />
        <div className="text-[12px] text-[#6a8c7a] leading-relaxed">
          I have read and agree to the{" "}
          <TermsModal onAccept={() => setAgreedToTerms(true)} />
        </div>
      </div>

      {/* Server error */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#fdf3f2] border border-[#f5c0bb] text-[#c0392b] text-[13px]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !agreedToTerms}
        className="w-full py-3 mt-1 bg-[#1e7a52] hover:bg-[#185f40] active:bg-[#1e7a52] text-white text-[14px] font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

    </form>
  );
}
