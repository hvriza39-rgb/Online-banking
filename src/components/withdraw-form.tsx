"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withdrawalRequestSchema, type WithdrawalRequestInput } from "@/lib/validators";
import { Loader2, AlertCircle, Clock, ArrowUpRight } from "lucide-react";
import { cn, currencySymbol } from "@/lib/utils";
import { Currency } from "@prisma/client";

interface WithdrawFormProps {
  maxAmount:  number;
  currency:   Currency;
  hasPending: boolean;
}

export function WithdrawForm({ maxAmount, currency, hasPending }: WithdrawFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<WithdrawalRequestInput>({ resolver: zodResolver(withdrawalRequestSchema) });

  const onSubmit = async (data: WithdrawalRequestInput) => {
    setError(null);
    if (data.amount > maxAmount) { setError("Amount exceeds available balance"); return; }
    const res  = await fetch("/api/withdrawals", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Request failed"); return; }
    router.refresh();
  };

  if (hasPending) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Pending request active</p>
          <p className="text-xs text-amber-600 mt-0.5">
            You already have a pending send request. Please wait for admin approval before submitting another.
          </p>
        </div>
      </div>
    );
  }

  const sym = currencySymbol(currency);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Amount ({currency})
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{sym}</span>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.01"
            max={maxAmount}
            placeholder="0.00"
            className={cn(
              "w-full pl-8 pr-4 py-3 rounded-xl border text-sm outline-none transition-all money",
              "focus:ring-2 focus:ring-slate-300 focus:border-slate-400",
              errors.amount ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
            )}
          />
        </div>
        {errors.amount
          ? <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.amount.message}</p>
          : <p className="mt-1.5 text-xs text-slate-400">Maximum: {sym}{maxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        }
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Note <span className="text-slate-300 normal-case font-normal">(optional)</span>
        </label>
        <input
          {...register("note")}
          placeholder="Reason for sending"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-[#1a1d27] hover:bg-[#23273a] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {isSubmitting
          ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
          : <><ArrowUpRight className="w-4 h-4" />Submit Send Request</>
        }
      </button>
    </form>
  );
}
