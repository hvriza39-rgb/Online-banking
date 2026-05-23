"use client";

import { useEffect } from "react";
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2, Download } from "lucide-react";
import { cn, formatMoney, formatDateTime } from "@/lib/utils";
import { TransactionType } from "@prisma/client";

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; border: string; sign: string;
}> = {
  CREDIT: {
    label: "Credit", icon: ArrowDownLeft,
    bg: "bg-[#edf7f5]", text: "text-[#0f7a6e]", border: "border-[#a8dbd4]",
    sign: "+",
  },
  DEBIT: {
    label: "Debit", icon: ArrowUpRight,
    bg: "bg-[#faeef0]", text: "text-[#b52b3a]", border: "border-[#e8b8be]",
    sign: "−",
  },
  WITHDRAWAL: {
    label: "Withdrawal", icon: ArrowUpRight,
    bg: "bg-[#faeef0]", text: "text-[#b52b3a]", border: "border-[#e8b8be]",
    sign: "−",
  },
};

export type ReceiptTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: Date;
  reference?: string | null;
};

interface Props {
  tx: ReceiptTransaction | null;
  currency: string;
  onClose: () => void;
}

export function TransactionReceiptModal({ tx, currency, onClose }: Props) {
  useEffect(() => {
    if (!tx) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tx, onClose]);

  if (!tx) return null;

  const cfg      = TX_CONFIG[tx.type];
  const Icon     = cfg.icon;
  const isCredit = tx.type === "CREDIT";
  const accent   = isCredit ? "#0f7a6e" : "#b52b3a";

  const handleDownload = () => {
    const scale  = 2;
    const W      = 420;
    const H      = 640;
    const canvas = document.createElement("canvas");
    canvas.width  = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Top color bar
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 6);

    // Header label
    ctx.fillStyle = "#a8c8b8";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText("TRANSACTION RECEIPT", 24, 38);

    // Amount
    ctx.fillStyle = accent;
    ctx.font = "bold 30px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${cfg.sign}${formatMoney(tx.amount, currency as any)}`, W / 2, 108);

    // Type label
    ctx.fillStyle = "#6a8c7a";
    ctx.font = "13px sans-serif";
    ctx.fillText(cfg.label, W / 2, 130);

    // Status pill
    ctx.fillStyle = "#edf7f5";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 54, 144, 108, 26, 13);
    ctx.fill();
    ctx.fillStyle = "#0f7a6e";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("✓  COMPLETED", W / 2, 161);

    // Dashed divider
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#ddeee7";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(24, 192);
    ctx.lineTo(W - 24, 192);
    ctx.stroke();
    ctx.setLineDash([]);

    // Detail rows
    const rows: [string, string][] = [
      ["Transaction ID", tx.id.slice(0, 22) + "…"],
      ["Date & Time",    formatDateTime(tx.createdAt)],
      ["Type",           cfg.label],
      ["Description",    tx.note ?? "—"],
      ["Balance After",  formatMoney(tx.balanceAfter, currency as any)],
      ...(tx.reference ? [["Reference", tx.reference] as [string, string]] : []),
    ];

    let y = 228;
    rows.forEach(([label, value]) => {
      // Label
      ctx.fillStyle = "#a8c8b8";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, 24, y);

      // Value
      ctx.fillStyle = "#2d5042";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(value, W - 24, y);

      // Subtle row separator
      ctx.strokeStyle = "#f0f7f4";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, y + 10);
      ctx.lineTo(W - 24, y + 10);
      ctx.stroke();

      y += 36;
    });

    // Footer branding
    ctx.fillStyle = "#c8dfd5";
    ctx.font      = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NexaBank  ·  Secure Banking", W / 2, H - 20);

    // Download
    const link    = document.createElement("a");
    link.download = `nexabank-receipt-${tx.id.slice(0, 8)}.png`;
    link.href     = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#0f2419]/40 backdrop-blur-sm" />

      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top color bar */}
        <div className={cn("h-1.5 w-full", isCredit ? "bg-[#0f7a6e]" : "bg-[#b52b3a]")} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#a8c8b8]">
            Transaction Receipt
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f0f7f4] hover:bg-[#e4f2ec] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#6a8c7a]" />
          </button>
        </div>

        {/* Amount hero */}
        <div className="flex flex-col items-center px-6 pb-6 pt-2">
          <div className={cn(
            "w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-4",
            cfg.bg, cfg.border
          )}>
            <Icon className={cn("w-6 h-6", cfg.text)} strokeWidth={2.5} />
          </div>
          <p className={cn(
            "text-3xl font-bold font-mono tracking-tight",
            isCredit ? "text-[#0f7a6e]" : "text-[#b52b3a]"
          )}>
            {cfg.sign}{formatMoney(tx.amount, currency as any)}
          </p>
          <p className="text-[#6a8c7a] text-sm mt-1">{cfg.label}</p>

          {/* Status pill */}
          <div className="flex items-center gap-1.5 mt-3 bg-[#edf7f5] border border-[#a8dbd4] px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0f7a6e]" />
            <span className="text-[11px] font-semibold text-[#0f7a6e] uppercase tracking-wide">Completed</span>
          </div>
        </div>

        {/* Dashed divider with circles */}
        <div className="relative flex items-center px-0 my-0">
          <div className="w-5 h-5 rounded-full bg-[#f0f7f4] border border-[#e0ede8] -ml-2.5 flex-shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-[#ddeee7]" />
          <div className="w-5 h-5 rounded-full bg-[#f0f7f4] border border-[#e0ede8] -mr-2.5 flex-shrink-0" />
        </div>

        {/* Details rows */}
        <div className="px-6 py-5 space-y-4 bg-[#fafcfb]">
          {[
            { label: "Transaction ID", value: tx.id.slice(0, 18) + "…", mono: true },
            { label: "Date & Time",    value: formatDateTime(tx.createdAt) },
            { label: "Type",           value: cfg.label },
            { label: "Description",    value: tx.note ?? "—" },
            { label: "Balance After",  value: formatMoney(tx.balanceAfter, currency as any), mono: true },
            ...(tx.reference ? [{ label: "Reference", value: tx.reference, mono: true }] : []),
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-start gap-4">
              <span className="text-[12px] text-[#a8c8b8] font-medium flex-shrink-0">{row.label}</span>
              <span className={cn(
                "text-[12px] text-[#2d5042] text-right break-all",
                row.mono ? "font-mono" : "font-medium"
              )}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 bg-[#fafcfb] flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#edf7f5] border border-[#a8dbd4] text-[#0f7a6e] text-sm font-semibold hover:bg-[#d6ede8] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#0f2419] text-white text-sm font-semibold hover:bg-[#1a3828] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
