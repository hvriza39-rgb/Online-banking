"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withdrawalRequestSchema, type WithdrawalRequestInput } from "@/lib/validators";
import {
  Loader2, AlertCircle, Clock, ArrowUpRight,
  Globe, MapPin, HelpCircle, MessageCircle,
  ShieldCheck, ShieldAlert, X, KeyRound, CheckCircle2,
  Building2, Wallet, ChevronRight, Landmark,
} from "lucide-react";
import { cn, currencySymbol } from "@/lib/utils";
import { Currency } from "@prisma/client";

interface WithdrawFormProps {
  maxAmount:        number;
  currency:         Currency;
  pendingStatus:    "PENDING" | "PENDING_VERIFICATION" | null;
  pendingRequestId: string | null;
}

const SEND_TYPES = [
  { value: "LOCAL",         label: "Local Transfer",    sub: "Same country",      icon: MapPin },
  { value: "INTERNATIONAL", label: "International",     sub: "Cross-border",      icon: Globe },
];

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

export function WithdrawForm({
  maxAmount,
  currency,
  pendingStatus,
  pendingRequestId,
}: WithdrawFormProps) {
  const router = useRouter();
  const [error, setError]             = useState<string | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingData, setPendingData] = useState<WithdrawalRequestInput | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [existingCode, setExistingCode] = useState("");
  const [verifying, setVerifying]     = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified]       = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<WithdrawalRequestInput>({
      resolver:      zodResolver(withdrawalRequestSchema),
      defaultValues: { sendType: "LOCAL" },
    });

  const sendType = watch("sendType");
  const amount   = watch("amount") || 0;
  const sym      = currencySymbol(currency);

  const setQuickAmount = (val: number) => {
    setValue("amount", val, { shouldValidate: true });
  };

  // ── PENDING block ──────────────────────────────────────────────────────────
  if (pendingStatus === "PENDING") {
    return (
      <div className="flex items-start gap-3 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-amber-900">Transfer pending</p>
          <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
            You already have a pending transfer. Please wait for it to be processed before submitting another.
          </p>
        </div>
      </div>
    );
  }

  // ── PENDING_VERIFICATION block ───────────────────────────────────────────
  if (pendingStatus === "PENDING_VERIFICATION") {
    const submitVerification = async () => {
      if (!pendingRequestId) return;
      setVerifying(true);
      setVerifyError(null);

      const res = await fetch("/api/withdrawals/verify", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          requestId:        pendingRequestId,
          verificationCode: existingCode.trim().toUpperCase(),
        }),
      });
      const json = await res.json();
      setVerifying(false);

      if (!res.ok) {
        setVerifyError(json.error ?? "Verification failed");
        return;
      }

      setVerified(true);
      setTimeout(() => router.refresh(), 1200);
    };

    if (verified) {
      return (
        <div className="flex flex-col items-center gap-3 p-8 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-emerald-900">Code accepted</p>
            <p className="text-[12px] text-emerald-700 mt-1">
              Your transfer has been queued for processing.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-5 bg-rose-50 border border-rose-100 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-rose-900">Verification required</p>
            <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
              You have a transfer on hold. Enter your security code below to release it for processing.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
            Security Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={existingCode}
              onChange={(e) => setExistingCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3D4"
              maxLength={16}
              disabled={verifying}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-mono tracking-[0.2em] outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 bg-white"
            />
          </div>
          {verifyError && (
            <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />{verifyError}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <button
            onClick={submitVerification}
            disabled={verifying || existingCode.trim().length === 0}
            className={cn(
              "w-full py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              existingCode.trim().length > 0 && !verifying
                ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {verifying
              ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</>
              : <><ShieldCheck className="w-4 h-4" />Submit Code</>
            }
          </button>

          <a
            href="/support"
            className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Talk to Support
          </a>
        </div>
      </div>
    );
  }

  // ── New withdrawal form ────────────────────────────────────────────────────

  const onSubmit = async (data: WithdrawalRequestInput) => {
    setError(null);
    if (data.amount > maxAmount) { setError("Amount exceeds available balance"); return; }
    setPendingData(data);
    setShowModal(true);
  };

  const submitWithdrawal = async (code: string | null) => {
    if (!pendingData) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/withdrawals", {
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

  const inputBase = "w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";
  const inputError = "border-rose-300 bg-rose-50/50";
  const inputNormal = "border-slate-200 hover:border-slate-300";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Transfer Type */}
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2.5">
            Transfer Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {SEND_TYPES.map(({ value, label, sub, icon: Icon }) => {
              const active = sendType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("sendType", value as "LOCAL" | "INTERNATIONAL", { shouldValidate: true })}
                  className={cn(
                    "relative flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 text-center transition-all",
                    active
                      ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                    active ? "bg-emerald-100" : "bg-slate-50"
                  )}>
                    <Icon className={cn("w-5 h-5", active ? "text-emerald-700" : "text-slate-400")} strokeWidth={2} />
                  </div>
                  <div>
                    <p className={cn("text-[13px] font-bold", active ? "text-emerald-800" : "text-slate-700")}>
                      {label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                  </div>
                  {active && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipient */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
              Recipient Name
            </label>
            <input
              {...register("recipientName")}
              placeholder="Full name as on account"
              className={cn(inputBase, errors.recipientName ? inputError : inputNormal)}
            />
            {errors.recipientName && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.recipientName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
              Account Number
            </label>
            <input
              {...register("recipientAccountNumber")}
              placeholder="e.g. 12345678"
              className={cn(inputBase, "font-mono tracking-wider", errors.recipientAccountNumber ? inputError : inputNormal)}
            />
            {errors.recipientAccountNumber && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.recipientAccountNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
              Bank Name
            </label>
            <div className="relative">
              <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                {...register("recipientBankName")}
                placeholder="e.g. Chase Bank"
                className={cn(inputBase, "pl-10", errors.recipientBankName ? inputError : inputNormal)}
              />
            </div>
            {errors.recipientBankName && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.recipientBankName.message}
              </p>
            )}
          </div>

          {sendType === "INTERNATIONAL" && (
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
                Country
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("recipientCountry")}
                  placeholder="e.g. United Kingdom"
                  className={cn(inputBase, "pl-10", errors.recipientCountry ? inputError : inputNormal)}
                />
              </div>
              {errors.recipientCountry && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.recipientCountry.message}
                </p>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">
                {sendType === "LOCAL" ? "Routing Number" : "Sort Code"}
              </label>
              <button
                type="button"
                onClick={() => setShowSupport((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-700 transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
                Where do I find this?
              </button>
            </div>
            <input
              {...register("routingCode")}
              placeholder={sendType === "LOCAL" ? "e.g. 021000021" : "e.g. 20-00-00"}
              className={cn(inputBase, "font-mono tracking-wider", errors.routingCode ? inputError : inputNormal)}
            />
            {errors.routingCode && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.routingCode.message}
              </p>
            )}
            {showSupport && (
              <div className="mt-3 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-emerald-900 mb-1">Need help?</p>
                  <p className="text-[11px] text-emerald-700 leading-relaxed mb-2">
                    You can find your {sendType === "LOCAL" ? "routing number" : "sort code"} on your bank statement or by contacting your bank.
                  </p>
                  <a
                    href="/support"
                    className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
            Amount ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{sym}</span>
            <input
              {...register("amount", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              placeholder="0.00"
              className={cn(
                "w-full pl-9 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all font-mono font-semibold",
                "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white",
                errors.amount ? "border-rose-300 bg-rose-50/50" : "border-slate-200 hover:border-slate-300"
              )}
            />
          </div>

          {/* Quick amount chips */}
          <div className="flex gap-2 mt-2.5 flex-wrap">
            {QUICK_AMOUNTS.filter(a => a <= maxAmount).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setQuickAmount(val)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                  amount === val
                    ? "bg-emerald-700 border-emerald-700 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400"
                )}
              >
                {sym}{val}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setQuickAmount(maxAmount)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                amount === maxAmount
                  ? "bg-emerald-700 border-emerald-700 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400"
              )}
            >
              Max
            </button>
          </div>

          {errors.amount
            ? <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.amount.message}</p>
            : <p className="mt-1.5 text-[11px] text-slate-400">Available: <span className="font-mono font-semibold text-slate-600">{sym}{maxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
          }
        </div>

        {/* Note */}
        <div>
          <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
            Note <span className="text-slate-300 normal-case font-normal">(optional)</span>
          </label>
          <input
            {...register("note")}
            placeholder="What's this for?"
            className={cn(inputBase, inputNormal)}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
        >
          {isSubmitting
            ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
            : <><ArrowUpRight className="w-4 h-4" />Review & Send</>
          }
        </button>
      </form>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !submitting && setShowModal(false)}
          />
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 z-10 animate-in slide-in-from-bottom-10 duration-300">

            {!submitting && (
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-[17px] font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Security Check
              </h2>
              <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed max-w-[260px]">
                Enter your verification code to complete this transfer. Skip to submit for manual review.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="A1B2C3D4"
                  maxLength={16}
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-mono tracking-[0.2em] outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 bg-white text-center"
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Without a valid code, your transfer will be held as <span className="font-bold">pending verification</span>.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => submitWithdrawal(verificationCode || null)}
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                  : <><ChevronRight className="w-4 h-4" />Confirm Transfer</>
                }
              </button>

              <a
                href="/support"
                className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Need Help?
              </a>
            </div>

            <div className="h-6" />
          </div>
        </div>
      )}
    </>
  );
}
