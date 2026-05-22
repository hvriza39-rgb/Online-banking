"use client";

import { useState } from "react";
import { ArrowDownLeft, X, Copy, Check, ShieldAlert } from "lucide-react";

interface Props {
  name: string;
  accountNumber: string | null;
  sortCode: string;
  currency: string;
  isVerified: boolean;
}

export default function ReceiveSheet({
  name, accountNumber, sortCode, currency, isVerified,
}: Props) {
  const [open, setOpen]       = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);

  const copy = async (val: string, key: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {}
  };

  const raw = accountNumber?.replace(/\s/g, "") ?? "";

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#e4e7ec] shadow-sm hover:border-[#d1d5db] transition-all active:scale-[0.97]"
      >
        <div className="w-9 h-9 rounded-full bg-[#f0fdf9] flex items-center justify-center">
          <ArrowDownLeft className="w-4 h-4 text-[#0d9488]" strokeWidth={1.8} />
        </div>
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#6b7280]">
          Receive
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-[24px] shadow-2xl max-w-lg mx-auto overflow-hidden">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#e4e7ec]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f3f8]">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#9ca3af]">
                NexaBank
              </p>
              <p className="text-[16px] font-semibold text-[#111827] mt-0.5">
                Receive Money
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-[#e5e7eb] transition-colors"
            >
              <X className="w-4 h-4 text-[#6b7280]" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 flex flex-col gap-3">

            {!isVerified && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  Complete KYC verification to reveal your account number and sort code.
                </p>
              </div>
            )}

            {/* Account holder name */}
            <DetailRow
              label="Account Name"
              value={name}
              copyKey="name"
              copied={copied}
              onCopy={() => copy(name, "name")}
            />

            {/* Account number */}
            <DetailRow
              label="Account Number"
              value={accountNumber ?? "Pending KYC"}
              copyKey="acct"
              copied={copied}
              onCopy={() => copy(raw, "acct")}
              mono
              disabled={!isVerified}
            />

            {/* Sort code */}
            <DetailRow
              label="Sort Code"
              value={isVerified ? sortCode : "Pending KYC"}
              copyKey="sort"
              copied={copied}
              onCopy={() => copy(sortCode.replace(/\s|—/g, ""), "sort")}
              mono
              disabled={!isVerified}
            />

            {/* Currency */}
            <DetailRow
              label="Currency"
              value={currency}
              copyKey="cur"
              copied={copied}
              onCopy={() => copy(currency, "cur")}
            />

          </div>

          {/* Safe area spacer */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
}

/* ── Reusable detail row ── */
function DetailRow({
  label, value, copyKey, copied, onCopy, mono = false, disabled = false,
}: {
  label: string; value: string; copyKey: string;
  copied: string | null; onCopy: () => void;
  mono?: boolean; disabled?: boolean;
}) {
  const isCopied = copied === copyKey;
  return (
    <div className="bg-[#f5f6f8] rounded-[14px] px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#9ca3af] mb-1">
          {label}
        </p>
        <p className={`text-[14px] font-semibold text-[#111827] truncate ${mono ? "font-mono tracking-[0.08em]" : ""} ${disabled ? "text-[#9ca3af]" : ""}`}>
          {value}
        </p>
      </div>
      {!disabled && (
        <button
          onClick={onCopy}
          className="w-8 h-8 rounded-full bg-white border border-[#e4e7ec] flex items-center justify-center flex-shrink-0 hover:border-[#0d9488]/40 transition-colors"
        >
          {isCopied
            ? <Check className="w-3.5 h-3.5 text-[#0d9488]" />
            : <Copy className="w-3.5 h-3.5 text-[#9ca3af]" />
          }
        </button>
      )}
    </div>
  );
}
