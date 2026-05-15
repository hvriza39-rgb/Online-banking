"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Copy, Check, ArrowRight } from "lucide-react";
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
      {/* Success icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-slate-900 mb-1">
        Identity Verified! 🎉
      </h2>
      <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
        Your account has been activated. Here's your unique account number — keep it safe.
      </p>

      {/* Account number display */}
      <div className="w-full max-w-xs mb-8">
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

      {/* What's next */}
      <div className="w-full max-w-xs bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-7 text-left">
        <p className="text-xs font-semibold text-blue-700 mb-2">What's next?</p>
        <ul className="space-y-1.5">
          {[
            "Your balance is ready to receive funds",
            "You can now make withdrawal requests",
            "Share your account number to receive credits",
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
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
