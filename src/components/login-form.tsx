"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Eye, EyeOff, Loader2, AlertCircle, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebAuthn } from "@/hooks/useWebAuthn";

export function LoginForm() {
  const router                        = useRouter();
  const [showPw, setShowPw]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { loginWithBiometric }        = useWebAuthn();

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const res = await signIn("credentials", {
      email: data.email, password: data.password, redirect: false,
    });
    if (res?.error) { setError("Invalid email or password. Please try again."); return; }

    const sessionRes = await fetch("/api/auth/session");
    const session    = await sessionRes.json();

    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  };

  const handleBiometric = async () => {
    setError(null);
    const email = getValues("email");
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      setBiometricLoading(true);
      await loginWithBiometric(email);
      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Biometric login failed. Please try again.");
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Email */}
      <div>
        <label className="block text-[13px] font-semibold text-[#2d5042] mb-1.5">
          Email address
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={cn(
            "w-full px-3.5 py-3 rounded-xl text-[14px] text-[#0f2419] outline-none transition-all",
            "bg-[#f2f9f6] border placeholder:text-[#a8c8b8]",
            "focus:bg-white focus:border-[#1e7a52] focus:shadow-[0_0_0_3px_rgba(30,122,82,0.1)]",
            errors.email
              ? "border-[#c0392b] bg-[#fdf3f2] focus:border-[#c0392b] focus:shadow-[0_0_0_3px_rgba(192,57,43,0.08)]"
              : "border-[#c8dfd5]"
          )}
        />
        {errors.email && (
          <p className="mt-1.5 text-[12px] text-[#c0392b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-[13px] font-semibold text-[#2d5042] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={cn(
              "w-full px-3.5 py-3 pr-11 rounded-xl text-[14px] text-[#0f2419] outline-none transition-all",
              "bg-[#f2f9f6] border placeholder:text-[#a8c8b8]",
              "focus:bg-white focus:border-[#1e7a52] focus:shadow-[0_0_0_3px_rgba(30,122,82,0.1)]",
              errors.password
                ? "border-[#c0392b] bg-[#fdf3f2] focus:border-[#c0392b] focus:shadow-[0_0_0_3px_rgba(192,57,43,0.08)]"
                : "border-[#c8dfd5]"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8c8b8] hover:text-[#2d5042] transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-[12px] text-[#c0392b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Server / biometric error */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#fdf3f2] border border-[#f5c0bb] text-[#c0392b] text-[13px]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || biometricLoading}
        className="w-full py-3 mt-1 bg-[#1e7a52] hover:bg-[#185f40] active:bg-[#1e7a52] text-white text-[14px] font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-[#c8dfd5]" />
        <span className="text-[12px] text-[#6a8c7a] font-medium">or</span>
        <div className="flex-1 h-px bg-[#c8dfd5]" />
      </div>

      {/* Biometric */}
      <button
        type="button"
        onClick={handleBiometric}
        disabled={isSubmitting || biometricLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#1e7a52]/30 text-[#1e7a52] text-[14px] font-medium hover:bg-[#f0f7f4] transition-colors disabled:opacity-50"
      >
        {biometricLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Fingerprint className="w-4 h-4" />
        }
        {biometricLoading ? "Verifying…" : "Sign in with Face ID / Fingerprint"}
      </button>

    </form>
  );
}
