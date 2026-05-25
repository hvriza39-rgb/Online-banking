"use client";

import { useState, useCallback } from "react";
import { cn, formatMoney, formatDateTime } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { TransactionType } from "@prisma/client";
import { TransactionReceiptModal, type ReceiptTransaction } from "./transaction-receipt-modal";

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; border: string;
  chipBg: string; chipText: string; sign: string;
}> = {
  CREDIT: {
    label: "Credit", icon: ArrowDownLeft,
    bg: "bg-[#edf7f5]", text: "text-[#0f7a6e]", border: "border-[#a8dbd4]",
    chipBg: "bg-[#edf7f5] border border-[#a8dbd4]", chipText: "text-[#0f7a6e]",
    sign: "+",
  },
  DEBIT: {
    label: "Debit", icon: ArrowUpRight,
    bg: "bg-[#faeef0]", text: "text-[#b52b3a]", border: "border-[#e8b8be]",
    chipBg: "bg-[#faeef0] border border-[#e8b8be]", chipText: "text-[#b52b3a]",
    sign: "−",
  },
  WITHDRAWAL: {
    label: "Withdrawal", icon: ArrowUpRight,
    bg: "bg-[#faeef0]", text: "text-[#b52b3a]", border: "border-[#e8b8be]",
    chipBg: "bg-[#faeef0] border border-[#e8b8be]", chipText: "text-[#b52b3a]",
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

  return (
    <>
      <div className="divide-y divide-[#f0f7f4]">
        {transactions.map((tx) => {
          const cfg  = TX_CONFIG[tx.type];
          const Icon = cfg.icon;
          return (
            <button
              key={tx.id}
              onClick={() => setSelected(tx)}
              className="w-full text-left flex items-center gap-3 px-4 py-4 hover:bg-[#e4f2ec] active:bg-[#d6ece3] transition-colors cursor-pointer sm:grid sm:grid-cols-[44px_1fr_130px_110px] sm:gap-4 sm:px-6"
            >
              {/* Icon */}
              <div className={cn(
                "w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0",
                cfg.bg, cfg.border
              )}>
                <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2.5} />
              </div>

              {/* Details — takes all space on mobile */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    cfg.chipBg, cfg.chipText
                  )}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[12px] text-[#6a8c7a] truncate">
                  {tx.note ?? "No description"}
                </p>
                {/* Date shown inside details on mobile, hidden on desktop */}
                <p className="text-[11px] text-[#2d5042] mt-0.5 sm:hidden">
                  {formatDateTime(tx.createdAt)}
                </p>
                <p className="text-[11px] text-[#a8c8b8] mt-0.5 font-mono">
                  After: {formatMoney(tx.balanceAfter, currency as any)}
                </p>
              </div>

              {/* Date — desktop only */}
              <div className="hidden sm:block">
                <p className="text-[12px] text-[#2d5042]">{formatDateTime(tx.createdAt)}</p>
              </div>

              {/* Amount — always visible, right aligned */}
              <div className="text-right flex-shrink-0 sm:col-start-4">
                <p className={cn(
                  "text-[13px] font-semibold font-mono",
                  tx.type === "CREDIT" ? "text-[#0f7a6e]" : "text-[#b52b3a]"
                )}>
                  {cfg.sign}{formatMoney(tx.amount, currency as any)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <TransactionReceiptModal tx={selected} currency={currency} onClose={close} />
    </>
  );
}
