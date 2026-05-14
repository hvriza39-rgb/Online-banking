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
  const router             = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const res = await signIn("credentials", {
      email: data.email, password: data.password, redirect: false,
    });
    if (res?.error) { setError("Invalid email or password"); return; }
    router.push("/");
    router.refresh();
  };

  const inputClass = (hasError: boolean) => cn(
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all",
    "bg-white/[0.06] border text-white placeholder-slate-500",
    "focus:bg-white/[0.09] focus:ring-2 focus:ring-blue-500/30",
    hasError
      ? "border-rose-500/50 focus:border-rose-500/70"
      : "border-white/[0.1] focus:border-blue-500/50"
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={inputClass(!!errors.email)}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className={cn(inputClass(!!errors.password), "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors.password.message}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
