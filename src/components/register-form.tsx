"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router             = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState<string | null>(null);

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
    "w-full px-3.5 py-3 rounded-[10px] text-[14px] text-[#0c0e12] outline-none transition-all",
    "bg-[#f3f4f7] border placeholder:text-[#9aa0ad]",
    "focus:bg-white focus:border-[#0c0e12] focus:shadow-[0_0_0_3px_rgba(12,14,18,0.07)]",
    hasError
      ? "border-[#c0392b] bg-[#fdf3f2] focus:border-[#c0392b] focus:shadow-[0_0_0_3px_rgba(192,57,43,0.08)]"
      : "border-[#e2e5ea]"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Full name */}
      <div>
        <label className="block text-[13px] font-semibold text-[#4b5262] mb-1.5">Full name</label>
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
        <label className="block text-[13px] font-semibold text-[#4b5262] mb-1.5">Email address</label>
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
        <label className="block text-[13px] font-semibold text-[#4b5262] mb-1.5">Account currency</label>
        <select
          {...register("currency")}
          className={cn(
            inputBase(!!errors.currency),
            "cursor-pointer appearance-auto"
          )}
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
        <label className="block text-[13px] font-semibold text-[#4b5262] mb-1.5">Password</label>
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
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aa0ad] hover:text-[#4b5262] transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="mt-1.5 text-[12px] text-[#c0392b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.password.message}
          </p>
        ) : (
          <p className="mt-1.5 text-[12px] text-[#9aa0ad]">
            At least 8 characters, one uppercase letter, one number.
          </p>
        )}
      </div>

      {/* Server error */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-[10px] bg-[#fdf3f2] border border-[#f5c0bb] text-[#c0392b] text-[13px]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 mt-1 bg-[#0c0e12] hover:bg-[#1e2229] active:bg-[#0c0e12] text-white text-[14px] font-bold rounded-[10px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-[11.5px] text-[#9aa0ad] text-center leading-relaxed pt-1">
        By creating an account you agree to our{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-[#4b5262] transition-colors">Terms of Service</span>
        {" "}and{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-[#4b5262] transition-colors">Privacy Policy</span>.
      </p>

    </form>
  );
}
