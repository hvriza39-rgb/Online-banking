"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fundAccountSchema, type FundAccountInput } from "@/lib/validators";
import { Loader2, AlertCircle, Plus, Minus } from "lucide-react";
import { cn, currencySymbol } from "@/lib/utils";
import { Currency } from "@prisma/client";

interface FundFormProps {
  userId:         string;
  currency:       Currency;
  currentBalance: number;
}

export function FundForm({ userId, currency, currentBalance }: FundFormProps) {
  const router     = useRouter();
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
    setError(null);
    setSuccess(null);

    const res  = await fetch("/api/admin/fund", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...data, userId }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Failed");
      return;
    }

    setSuccess(`Balance ${type === "CREDIT" ? "credited" : "debited"} successfully`);
    reset({ userId, type: "CREDIT" });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Action</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["CREDIT", "DEBIT"] as const).map((t) => (
            <label
              key={t}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium cursor-pointer transition-colors",
                type === t
                  ? t === "CREDIT"
                    ? "bg-green-600 text-white"
                    : "bg-red-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <input {...register("type")} type="radio" value={t} className="sr-only" />
              {t === "CREDIT" ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {t === "CREDIT" ? "Add Funds" : "Deduct Funds"}
            </label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount ({currency})</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{sym}</span>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className={cn(
              "w-full pl-8 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors money",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              errors.amount ? "border-red-400 bg-red-50" : "border-gray-200"
            )}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
        {type === "DEBIT" && (
          <p className="mt-1 text-xs text-gray-400">Current balance: {sym}{currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        )}
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          {...register("note")}
          placeholder="Reason for adjustment"
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          ✓ {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubmitting ? "Processing…" : "Confirm"}
      </button>
    </form>
  );
}
