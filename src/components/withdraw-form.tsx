"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withdrawalRequestSchema, type WithdrawalRequestInput } from "@/lib/validators";
import {
  Loader2, AlertCircle, Clock, ArrowUpRight,
  Globe, MapPin, HelpCircle, MessageCircle,
  ShieldCheck, X, KeyRound,
} from "lucide-react";
import { cn, currencySymbol } from "@/lib/utils";
import { Currency } from "@prisma/client";

interface WithdrawFormProps {
  maxAmount:  number;
  currency:   Currency;
  hasPending: boolean;
}

const SEND_TYPES = [
  { value: "LOCAL",         label: "Local",         sub: "Within the US",    icon: MapPin },
  { value: "INTERNATIONAL", label: "International", sub: "Overseas transfer", icon: Globe },
];

const inputClass = (hasError: boolean) =>
  cn(
    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
    "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white",
    hasError ? "border-rose-300 bg-rose-50" : "border-slate-200"
  );

const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2";

export function WithdrawForm({ maxAmount, currency, hasPending }: WithdrawFormProps) {
  const router = useRouter();
  const [error, setError]                   = useState<string | null>(null);
  const [showSupport, setShowSupport]       = useState(false);

  // Verification modal state
  const [showModal, setShowModal]           = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingData, setPendingData]       = useState<WithdrawalRequestInput | null>(null);
  const [submitting, setSubmitting]         = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<WithdrawalRequestInput>({
      resolver:      zodResolver(withdrawalRequestSchema),
      defaultValues: { sendType: "LOCAL" },
    });

  const sendType = watch("sendType");

  // Step 1: form submits → open modal
  const onSubmit = async (data: WithdrawalRequestInput) => {
    setError(null);
    if (data.amount > maxAmount) { setError("Amount exceeds available balance"); return; }
    setPendingData(data);
    setShowModal(true);
  };

  // Step 2: modal submits (with or without code)
  const submitWithdrawal = async (code: string | null) => {
    if (!pendingData) return;
    setSubmitting(true);
    setError(null);

    const res  = await fetch("/api/withdrawals", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        ...pendingData,
        verificationCode: code || null,
      }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "Request failed");
      setShowModal(false);
      return;
    }

    setShowModal(false);
    router.refresh();
  };

  if (hasPending) {
    return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Transfer pending</p>
          <p className="text-xs text-amber-600 mt-0.5">
            You already have a pending transfer. Please wait for it to be processed before submitting another.
          </p>
        </div>
      </div>
    );
  }

  const sym = currencySymbol(currency);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Send type */}
        <div>
          <label className={labelClass}>Transfer Type</label>
          <div className="grid grid-cols-2 gap-2">
            {SEND_TYPES.map(({ value, label, sub, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue("sendType", value as "LOCAL" | "INTERNATIONAL", { shouldValidate: true })}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                  sendType === value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  sendType === value ? "bg-blue-100" : "bg-slate-100"
                )}>
                  <Icon className={cn("w-4 h-4", sendType === value ? "text-blue-600" : "text-slate-400")} />
                </div>
                <div>
                  <p className={cn("text-[13px] font-semibold", sendType === value ? "text-blue-700" : "text-slate-700")}>
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-400">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient account number */}
        <div>
          <label className={labelClass}>Recipient Account Number</label>
          <input
            {...register("recipientAccountNumber")}
            placeholder="e.g. 12345678"
            className={cn(inputClass(!!errors.recipientAccountNumber), "font-mono tracking-wider")}
          />
          {errors.recipientAccountNumber && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.recipientAccountNumber.message}
            </p>
          )}
        </div>

        {/* Recipient full name */}
        <div>
          <label className={labelClass}>Recipient Full Name</label>
          <input
            {...register("recipientName")}
            placeholder="As it appears on their account"
            className={inputClass(!!errors.recipientName)}
          />
          {errors.recipientName && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.recipientName.message}
            </p>
          )}
        </div>

        {/* Routing / Sort code */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={cn(labelClass, "mb-0")}>
              {sendType === "LOCAL" ? "Routing Number" : "Sort Code"}
            </label>
            <button
              type="button"
              onClick={() => setShowSupport((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-500 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              Don't have a {sendType === "LOCAL" ? "routing number" : "sort code"}?
            </button>
          </div>
          <input
            {...register("routingCode")}
            placeholder={sendType === "LOCAL" ? "e.g. 021000021" : "e.g. 20-00-00"}
            className={cn(inputClass(!!errors.routingCode), "font-mono tracking-wider")}
          />
          {errors.routingCode && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.routingCode.message}
            </p>
          )}
          {showSupport && (
            <div className="mt-3 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <MessageCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-blue-800 mb-0.5">Need help?</p>
                <p className="text-[11px] text-blue-600 leading-relaxed mb-2">
                  You can find your {sendType === "LOCAL" ? "routing number" : "sort code"} on your bank statement or by contacting your bank.
                  Our support team can also help you locate it.
                </p>
                <a
                  href="/support"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                >
                  <MessageCircle className="w-3 h-3" />
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className={labelClass}>Amount ({currency})</label>
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
                "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
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
          <label className={labelClass}>
            Note <span className="text-slate-300 normal-case font-normal">(optional)</span>
          </label>
          <input
            {...register("note")}
            placeholder="Reason for transfer"
            className={inputClass(false)}
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
            : <><ArrowUpRight className="w-4 h-4" />Submit Transfer</>
          }
        </button>
      </form>

      {/* Verification Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !submitting && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-10">

            {/* Close */}
            {!submitting && (
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Icon + heading */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1d27] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900">Verification Required</h2>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                Enter your security code to complete this transfer. If you don't have one, you can still submit — your transaction will be held pending verification.
              </p>
            </div>

            {/* Code input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Security Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  maxLength={16}
                  disabled={submitting}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-mono tracking-widest outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Notice banner */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl mb-5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Transfers submitted without a valid code will be held as <span className="font-semibold">pending verification</span> and will not be processed until verified.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => submitWithdrawal(verificationCode || null)}
                disabled={submitting}
                className="w-full py-3 bg-[#1a1d27] hover:bg-[#23273a] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                  : <><ArrowUpRight className="w-4 h-4" />Submit Transfer</>
                }
              </button>

              <a
                href="/support"
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to Support
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
