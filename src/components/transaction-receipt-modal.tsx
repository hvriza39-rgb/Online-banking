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
    bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100",
    sign: "+",
  },
  DEBIT: {
    label: "Debit", icon: ArrowUpRight,
    bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100",
    sign: "−",
  },
  WITHDRAWAL: {
    label: "Withdrawal", icon: ArrowUpRight,
    bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100",
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
  senderName?: string | null;
  senderAccountNumber?: string | null;
  recipientName?: string | null;
  recipientAccountNumber?: string | null;
  routingCode?: string | null;
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
  const accent   = isCredit ? "#059669" : "#e11d48";

  const detailRows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Transaction ID",       value: tx.id.slice(0, 18) + "…",                          mono: true  },
    { label: "Date & Time",          value: formatDateTime(tx.createdAt) },
    { label: "Type",                 value: cfg.label },
    ...(tx.senderName              ? [{ label: "Sender",                value: tx.senderName }] : []),
    ...(tx.senderAccountNumber     ? [{ label: "Sender Account",        value: tx.senderAccountNumber,     mono: true  }] : []),
    ...(tx.recipientName           ? [{ label: "Recipient",             value: tx.recipientName }] : []),
    ...(tx.recipientAccountNumber  ? [{ label: "Recipient Account",     value: tx.recipientAccountNumber,  mono: true  }] : []),
    ...(tx.routingCode             ? [{ label: "Routing Code",          value: tx.routingCode,             mono: true  }] : []),
    { label: "Description",          value: tx.note ?? "—" },
    { label: "Balance After",        value: formatMoney(tx.balanceAfter, currency as any),      mono: true  },
    ...(tx.reference               ? [{ label: "Reference",             value: tx.reference,               mono: true  }] : []),
  ];

  const handleDownload = () => {
    const scale    = 3; // retina crispness
    const W        = 420;
    const PAD      = 32;
    const ROW_H    = 40;
    const HEADER_H = 180;
    const FOOTER_H = 56;
    const H        = HEADER_H + detailRows.length * ROW_H + FOOTER_H;

    const canvas  = document.createElement("canvas");
    canvas.width  = W * scale;
    canvas.height = H * scale;
    const ctx     = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // ── Background ──
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // ── Top accent bar ──
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, 5);

    // ── Receipt label ──
    ctx.fillStyle = "#94a3b8";
    ctx.font      = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("RECEIPT", PAD, 38);

    // ── Amount ──
    ctx.fillStyle = "#0f172a";
    ctx.font      = "bold 34px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${cfg.sign}${formatMoney(tx.amount, currency as any)}`, W / 2, 90);

    // ── Type ──
    ctx.fillStyle = "#64748b";
    ctx.font      = "14px sans-serif";
    ctx.fillText(cfg.label, W / 2, 114);

    // ── Status pill ──
    const pillW = 110;
    const pillH = 28;
    const pillX = (W - pillW) / 2;
    const pillY = 128;
    ctx.fillStyle = "#ecfdf5";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.strokeStyle = "#a7f3d0";
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.fillStyle = "#059669";
    ctx.font      = "bold 11px sans-serif";
    ctx.fillText("✓  COMPLETED", W / 2, pillY + 18);

    // ── Divider line ──
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, 178);
    ctx.lineTo(W - PAD, 178);
    ctx.stroke();

    // ── Detail rows ──
    let y = 200;
    detailRows.forEach(({ label, value }) => {
      ctx.fillStyle = "#94a3b8";
      ctx.font      = "12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, PAD, y);

      ctx.fillStyle = "#0f172a";
      ctx.font      = "12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(value, W - PAD, y);

      // subtle separator
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, y + 12);
      ctx.lineTo(W - PAD, y + 12);
      ctx.stroke();

      y += ROW_H;
    });

    // ── Footer ──
    ctx.fillStyle = "#cbd5e1";
    ctx.font      = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NexaBank · Secure Banking", W / 2, H - 20);

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
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />

      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-[28px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className={cn("h-1.5 w-full", isCredit ? "bg-emerald-600" : "bg-rose-500")} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Receipt
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Amount hero */}
        <div className="flex flex-col items-center px-6 pb-6 pt-3">
          <div className={cn(
            "w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-sm",
            cfg.bg, cfg.border
          )}>
            <Icon className={cn("w-6 h-6", cfg.text)} strokeWidth={2.5} />
          </div>

          <p className={cn(
            "text-[32px] font-bold font-mono tracking-tight tabular-nums",
            isCredit ? "text-emerald-700" : "text-rose-600"
          )}>
            {cfg.sign}{formatMoney(tx.amount, currency as any)}
          </p>
          <p className="text-slate-400 text-sm mt-1 font-medium">{cfg.label}</p>

          {/* Status */}
          <div className="flex items-center gap-1.5 mt-4 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
              Completed
            </span>
          </div>
        </div>

        {/* Clean divider */}
        <div className="mx-6 h-px bg-slate-100" />

        {/* Details */}
        <div className="px-6 py-5 space-y-4 bg-slate-50/50">
          {detailRows.map((row) => (
            <div key={row.label} className="flex justify-between items-start gap-4">
              <span className="text-[12px] text-slate-400 font-medium flex-shrink-0 pt-0.5">
                {row.label}
              </span>
              <span className={cn(
                "text-[13px] text-slate-900 text-right break-all leading-snug",
                row.mono ? "font-mono" : "font-semibold"
              )}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-2 bg-slate-50/50 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
