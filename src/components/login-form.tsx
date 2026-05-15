"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router              = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const res = await signIn("credentials", {
      email: data.email, password: data.password, redirect: false,
    });
    if (res?.error) { setError("Invalid email or password. Please try again."); return; }
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Email */}
      <div>
        <label className="block text-[13px] font-semibold text-[#4b5262] mb-1.5">
          Email address
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={cn(
            "w-full px-3.5 py-3 rounded-[10px] text-[14px] text-[#0c0e12] outline-none transition-all",
            "bg-[#f3f4f7] border placeholder:text-[#9aa0ad]",
            "focus:bg-white focus:border-[#0c0e12] focus:shadow-[0_0_0_3px_rgba(12,14,18,0.07)]",
            errors.email
              ? "border-[#c0392b] bg-[#fdf3f2] focus:border-[#c0392b] focus:shadow-[0_0_0_3px_rgba(192,57,43,0.08)]"
              : "border-[#e2e5ea]"
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
        <label className="block text-[13px] font-semibold text-[#4b5262] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            className={cn(
              "w-full px-3.5 py-3 pr-11 rounded-[10px] text-[14px] text-[#0c0e12] outline-none transition-all",
              "bg-[#f3f4f7] border placeholder:text-[#9aa0ad]",
              "focus:bg-white focus:border-[#0c0e12] focus:shadow-[0_0_0_3px_rgba(12,14,18,0.07)]",
              errors.password
                ? "border-[#c0392b] bg-[#fdf3f2] focus:border-[#c0392b] focus:shadow-[0_0_0_3px_rgba(192,57,43,0.08)]"
                : "border-[#e2e5ea]"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aa0ad] hover:text-[#4b5262] transition-colors"
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
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>

    </form>
  );
}
