"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fundAccountSchema, type FundAccountInput } from "@/lib/validators";
import { Loader2, AlertCircle, Plus, Minus, CheckCircle2 } from "lucide-react";
import { cn, currencySymbol } from "@/lib/utils";
import { Currency } from "@prisma/client";

interface FundFormProps {
  userId:         string;
  currency:       Currency;
  currentBalance: number;
}

export function FundForm({ userId, currency, currentBalance }: FundFormProps) {
  const router = useRouter();
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } =
    useForm<FundAccountInput>({
      resolver: zodResolver(fundAccountSchema),
      defaultValues: { userId, type: "CREDIT" },
    });

  const type = watch("type");
  const sym  = currencySymbol(currency);

  const onSubmit = async (data: FundAccountInput) => {
    setError(null); setSuccess(null);
    const res  = await fetch("/api/admin/fund", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, userId }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Failed"); return; }
    setSuccess(`Balance ${type === "CREDIT" ? "credited" : "debited"} successfully`);
    reset({ userId, type: "CREDIT" });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type toggle */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Action</label>
        <div className="grid grid-cols-2 gap-2">
          {(["CREDIT", "DEBIT"] as const).map((t) => (
            <label key={t} className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold",
              type === t
                ? t === "CREDIT"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200"
                  : "bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-200"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
            )}>
              <input {...register("type")} type="radio" value={t} className="sr-only" />
              {t === "CREDIT"
                ? <><Plus className="w-4 h-4" /> Add Funds</>
                : <><Minus className="w-4 h-4" /> Deduct Funds</>
              }
            </label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Amount ({currency})
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{sym}</span>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number" step="0.01" min="0.01" placeholder="0.00"
            className={cn(
              "w-full pl-8 pr-4 py-3 rounded-xl border text-sm outline-none transition-all money",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              errors.amount ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
            )}
          />
        </div>
        {errors.amount
          ? <p className="mt-1.5 text-xs text-rose-500">{errors.amount.message}</p>
          : type === "DEBIT" && <p className="mt-1.5 text-xs text-slate-400">Current balance: {sym}{currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        }
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Note <span className="text-slate-300 normal-case font-normal">(optional)</span>
        </label>
        <input
          {...register("note")}
          placeholder="Reason for adjustment"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
        </div>
      )}

      <button
        type="submit" disabled={isSubmitting}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Processing…" : "Confirm Adjustment"}
      </button>
    </form>
  );
}
