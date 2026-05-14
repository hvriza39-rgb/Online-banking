"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router              = useRouter();
  const [showPw, setShowPw]  = useState(false);
  const [error, setError]    = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const res  = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Registration failed"); return; }
    router.push("/login?registered=1");
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
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
        <input {...register("name")} placeholder="John Doe" className={inputClass(!!errors.name)} />
        {errors.name && (
          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
        <input {...register("email")} type="email" placeholder="you@example.com" className={inputClass(!!errors.email)} />
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors.email.message}
          </p>
        )}
      </div>

      {/* Currency */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Currency</label>
        <select
          {...register("currency")}
          className={cn(inputClass(!!errors.currency), "cursor-pointer")}
          style={{ colorScheme: "dark" }}
        >
          <option value="" disabled className="bg-slate-900">Select currency</option>
          <option value="USD" className="bg-slate-900">🇺🇸 USD — US Dollar</option>
          <option value="EUR" className="bg-slate-900">🇪🇺 EUR — Euro</option>
        </select>
        {errors.currency && (
          <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors.currency.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
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
        className="w-full py-3 mt-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
