"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withdrawalRequestSchema, type WithdrawalRequestInput } from "@/lib/validators";
import { Loader2, AlertCircle } from "lucide-react";
import { cn, currencySymbol } from "@/lib/utils";
import { Currency } from "@prisma/client";

interface WithdrawFormProps {
  maxAmount: number;
  currency:  Currency;
  hasPending: boolean;
}

export function WithdrawForm({ maxAmount, currency, hasPending }: WithdrawFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<WithdrawalRequestInput>({
      resolver: zodResolver(withdrawalRequestSchema),
    });

  const onSubmit = async (data: WithdrawalRequestInput) => {
    setError(null);
    if (data.amount > maxAmount) {
      setError("Amount exceeds your available balance");
      return;
    }

    const res  = await fetch("/api/withdrawals", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Request failed");
      return;
    }

    router.refresh();
  };

  if (hasPending) {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        You already have a pending withdrawal request. Please wait for admin approval.
      </div>
    );
  }

  const sym = currencySymbol(currency);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Amount ({currency})
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {sym}
          </span>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.01"
            max={maxAmount}
            placeholder="0.00"
            className={cn(
              "w-full pl-8 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors money",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              errors.amount ? "border-red-400 bg-red-50" : "border-gray-200"
            )}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
        <p className="mt-1 text-xs text-gray-400">Max: {sym}{maxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register("note")}
          placeholder="Reason for withdrawal"
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Submitting…" : "Submit Withdrawal Request"}
      </button>
    </form>
  );
}
