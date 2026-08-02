"use client";

import { useState, useCallback } from "react";
import { cn, formatMoney, formatDateTime } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { TransactionType } from "@prisma/client";
import { TransactionReceiptModal, type ReceiptTransaction } from "./transaction-receipt-modal";

const TX_CONFIG: Record<TransactionType, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  amountColor: string;
  sign: string;
}> = {
  CREDIT: {
    label: "Credit",
    icon: ArrowDownLeft,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    amountColor: "text-emerald-700",
    sign: "+",
  },
  DEBIT: {
    label: "Debit",
    icon: ArrowUpRight,
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
    amountColor: "text-rose-600",
    sign: "−",
  },
  WITHDRAWAL: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
    amountColor: "text-rose-600",
    sign: "−",
  },
};

interface Props {
  transactions: ReceiptTransaction[];
  currency: string;
}

export function TransactionList({ transactions, currency }: Props) {
  const [selected, setSelected] = useState<ReceiptTransaction | null>(null);
  const close = useCallback(() => setSelected(null), []);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
          <ArrowUpRight className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-[15px] font-bold text-slate-900 mb-1">No transactions yet</p>
        <p className="text-[13px] text-slate-400 max-w-[240px] leading-relaxed">
          Your transaction history will appear here once you start sending or receiving funds.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-slate-50">
        {transactions.map((tx) => {
          const cfg = TX_CONFIG[tx.type];
          const Icon = cfg.icon;

          return (
            <button
              key={tx.id}
              onClick={() => setSelected(tx)}
              className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors group"
            >
              {/* Icon */}
              <div className={cn(
                "w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                cfg.bg, cfg.border
              )}>
                <Icon className={cn("w-5 h-5", cfg.text)} strokeWidth={2.5} />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    cfg.bg, cfg.border, cfg.text
                  )}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-slate-900 mt-1 truncate">
                  {tx.note ?? "Transfer"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-slate-400 font-mono">
                    {formatDateTime(tx.createdAt)}
                  </p>
                  <span className="text-slate-200">·</span>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Bal {formatMoney(tx.balanceAfter, currency as any)}
                  </p>
                </div>
              </div>

              {/* Amount + chevron */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className={cn(
                    "text-[14px] font-bold font-mono tabular-nums",
                    cfg.amountColor
                  )}>
                    {cfg.sign}{formatMoney(tx.amount, currency as any)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      <TransactionReceiptModal tx={selected} currency={currency} onClose={close} />
    </>
  );
}
