"use client";

import { useState } from "react";
import { ArrowDownLeft, X, Copy, Check, ShieldAlert } from "lucide-react";
import Image from "next/image";

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
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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
      {/* Trigger — circular, blue tint for "receive/incoming" */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-2 group"
      >
        <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center group-hover:bg-sky-100 group-hover:scale-105 transition-all shadow-sm">
          <ArrowDownLeft className="w-5 h-5 text-sky-700" strokeWidth={2} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Receive
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm"
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
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <Image
                src="/nexabank-logo.svg"
                alt="NexaBank"
                width={120}
                height={38}
                className="h-9 w-auto"
              />
              <p className="text-[16px] font-bold text-slate-900 mt-1.5"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                Receive Money
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 flex flex-col gap-3">
            {!isVerified && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  Complete KYC verification to reveal your account number and sort code.
                </p>
              </div>
            )}

            <DetailRow
              label="Account Name"
              value={name}
              copyKey="name"
              copied={copied}
              onCopy={() => copy(name, "name")}
            />

            <DetailRow
              label="Account Number"
              value={accountNumber ?? "Pending KYC"}
              copyKey="acct"
              copied={copied}
              onCopy={() => copy(raw, "acct")}
              mono
              disabled={!isVerified}
            />

            <DetailRow
              label="Sort Code"
              value={isVerified ? sortCode : "Pending KYC"}
              copyKey="sort"
              copied={copied}
              onCopy={() => copy(sortCode.replace(/\s|—/g, ""), "sort")}
              mono
              disabled={!isVerified}
            />

            <DetailRow
              label="Currency"
              value={currency}
              copyKey="cur"
              copied={copied}
              onCopy={() => copy(currency, "cur")}
            />
          </div>

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
    <div className="bg-slate-50 rounded-xl px-4 py-3.5 flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1">
          {label}
        </p>
        <p className={`text-[14px] font-semibold truncate ${
          mono ? "font-mono tracking-[0.08em]" : ""
        } ${disabled ? "text-slate-400" : "text-slate-900"}`}>
          {value}
        </p>
      </div>
      {!disabled && (
        <button
          onClick={onCopy}
          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 hover:border-emerald-400 transition-colors"
        >
          {isCopied
            ? <Check className="w-3.5 h-3.5 text-emerald-600" />
            : <Copy className="w-3.5 h-3.5 text-slate-400" />
          }
        </button>
      )}
    </div>
  );
}
