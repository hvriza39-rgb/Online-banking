"use client";

import { useState, useEffect } from "react";
import { Clock, Copy, Check, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface KycSuccessProps {
  accountNumber: string;
  onContinue:    () => void;
}

export function KycSuccess({ accountNumber, onContinue }: KycSuccessProps) {
  const [copied, setCopied]   = useState(false);
  const [visible, setVisible] = useState(false);

  // Stagger entrance
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex flex-col items-center text-center py-10 px-6 transition-all duration-500",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      {/* Pending icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-200">
          <Clock className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-slate-900 mb-1">
        Submission Received!
      </h2>
      <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
        Your account number is ready and your details are under review.
        You'll get full access once system approves your verification.
      </p>

      {/* Account number display */}
      <div className="w-full max-w-xs mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Your Account Number
        </p>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex-1">
            <p className="text-2xl font-bold text-slate-900 tracking-[0.15em] font-mono">
              {accountNumber.slice(0, 5)}{" "}
              {accountNumber.slice(5)}
            </p>
          </div>
          <button
            onClick={copy}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
              copied
                ? "bg-emerald-100 text-emerald-600"
                : "bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
            )}
            title="Copy account number"
          >
            {copied
              ? <Check className="w-4 h-4" />
              : <Copy className="w-4 h-4" />
            }
          </button>
        </div>
        {copied && (
          <p className="text-xs text-emerald-600 mt-2 text-center font-medium">Copied to clipboard!</p>
        )}
      </div>

      {/* Pending status badge */}
      <div className="w-full max-w-xs flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs font-semibold text-amber-700 text-left">
          Pending  verification — withdrawals and sends are locked until approved.
        </p>
      </div>

      {/* What happens next */}
      <div className="w-full max-w-xs bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-7 text-left">
        <p className="text-xs font-semibold text-blue-700 mb-2">What happens next?</p>
        <ul className="space-y-1.5">
          {[
            "Your details are queued for review",
            "You'll be notified once your account is approved",
            "Sends and withdrawals unlock after approval",
            "You can already receive credits to your account number",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-blue-600">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-blue-200"
      >
        Go to Account Overview
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
