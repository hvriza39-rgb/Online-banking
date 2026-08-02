"use client";

import { useEffect } from "react";
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2, Download } from "lucide-react";
import { cn, formatMoney, formatDateTime } from "@/lib/utils";
import { TransactionType } from "@prisma/client";
import Image from "next/image";

const TX_CONFIG: Record<TransactionType, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  border: string;
  sign: string;
}> = {
  CREDIT: {
    label: "Credit",
    icon: ArrowDownLeft,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    sign: "+",
  },
  DEBIT: {
    label: "Debit",
    icon: ArrowUpRight,
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
    sign: "−",
  },
  WITHDRAWAL: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
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

/* Generate a visual barcode pattern from the transaction ID */
function Barcode({ value, className }: { value: string; className?: string }) {
  const bars = Array.from(value).map((char, i) => {
    const code = char.charCodeAt(0);
    const width = (code % 3) + 1;
    const isGap = code % 7 === 0;
    return { width, isGap, key: i };
  });

  return (
    <div className={cn("flex items-center h-10 gap-0", className)}>
      {bars.map((bar) =>
        bar.isGap ? (
          <div key={bar.key} style={{ width: bar.width }} className="h-full" />
        ) : (
          <div
            key={bar.key}
            style={{ width: bar.width }}
            className="h-full bg-slate-900"
          />
        )
      )}
    </div>
  );
}

export function TransactionReceiptModal({ tx, currency, onClose }: Props) {
  useEffect(() => {
    if (!tx) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tx, onClose]);

  if (!tx) return null;

  const cfg = TX_CONFIG[tx.type];
  const Icon = cfg.icon;
  const isCredit = tx.type === "CREDIT";

  const detailRows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Transaction ID", value: tx.id.slice(0, 18) + "…", mono: true },
    { label: "Date & Time", value: formatDateTime(tx.createdAt) },
    { label: "Type", value: cfg.label },
    ...(tx.senderName ? [{ label: "Sender", value: tx.senderName }] : []),
    ...(tx.senderAccountNumber
      ? [{ label: "Sender Account", value: tx.senderAccountNumber, mono: true }]
      : []),
    ...(tx.recipientName ? [{ label: "Recipient", value: tx.recipientName }] : []),
    ...(tx.recipientAccountNumber
      ? [{ label: "Recipient Account", value: tx.recipientAccountNumber, mono: true }]
      : []),
    ...(tx.routingCode
      ? [{ label: "Routing Code", value: tx.routingCode, mono: true }]
      : []),
    { label: "Description", value: tx.note ?? "—" },
    {
      label: "Balance After",
      value: formatMoney(tx.balanceAfter, currency as any),
      mono: true,
    },
    ...(tx.reference ? [{ label: "Reference", value: tx.reference, mono: true }] : []),
  ];

  const handleDownload = () => {
    const scale = 3;
    const W = 420;
    const PAD = 32;
    const ROW_H = 42;
    const HEADER_H = 210;
    const FOOTER_H = 100;
    const H = HEADER_H + detailRows.length * ROW_H + FOOTER_H;

    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Top accent
    ctx.fillStyle = isCredit ? "#059669" : "#e11d48";
    ctx.fillRect(0, 0, W, 5);

    // Logo mark (hexagon with N)
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    const cx = W / 2;
    const cy = 50;
    const r = 18;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // N letter
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", cx, cy);

    // Brand name
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("NexaBank", cx, cy + 28);

    // Amount
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px monospace";
    ctx.fillText(
      `${cfg.sign}${formatMoney(tx.amount, currency as any)}`,
      cx,
      118
    );

    // Type
    ctx.fillStyle = "#64748b";
    ctx.font = "13px sans-serif";
    ctx.fillText(cfg.label, cx, 140);

    // Status pill
    const pillW = 120;
    const pillH = 28;
    const pillX = (W - pillW) / 2;
    const pillY = 152;
    ctx.fillStyle = "#ecfdf5";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.strokeStyle = "#a7f3d0";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#059669";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("✓  COMPLETED", cx, pillY + 18);

    // Divider
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, 198);
    ctx.lineTo(W - PAD, 198);
    ctx.stroke();

    // Rows
    let y = 222;
    detailRows.forEach(({ label, value }) => {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, PAD, y);

      ctx.fillStyle = "#0f172a";
      ctx.font = "12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(value, W - PAD, y);

      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, y + 12);
      ctx.lineTo(W - PAD, y + 12);
      ctx.stroke();

      y += ROW_H;
    });

    // Barcode
    const barcodeY = y + 16;
    const bars = Array.from(tx.id).map((char) => {
      const code = char.charCodeAt(0);
      return { width: (code % 3) + 1, isGap: code % 7 === 0 };
    });

    let bx = PAD;
    bars.forEach((bar) => {
      if (!bar.isGap) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(bx, barcodeY, bar.width, 36);
      }
      bx += bar.width;
    });

    // Barcode text
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(tx.id.slice(0, 24).toUpperCase(), cx, barcodeY + 50);

    // Footer
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px sans-serif";
    ctx.fillText("NexaBank · Secure Banking · nexabank.com", cx, H - 20);

    const link = document.createElement("a");
    link.download = `nexabank-receipt-${tx.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
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
        {/* Top accent */}
        <div
          className={cn("h-1.5 w-full", isCredit ? "bg-emerald-600" : "bg-rose-500")}
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Header with logo */}
        <div className="flex flex-col items-center px-6 pt-6 pb-2">
          <div className="relative w-[52px] h-[52px] mb-3">
            <Image
              src="/nexabank-logo.svg"
              alt="NexaBank"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-[13px] font-bold text-slate-900 tracking-wide">
            NexaBank
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5">
            Official Receipt
          </p>
        </div>

        {/* Amount hero */}
        <div className="flex flex-col items-center px-6 pb-5 pt-2">
          <div
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center mb-3 shadow-sm",
              cfg.bg,
              cfg.border
            )}
          >
            <Icon className={cn("w-5 h-5", cfg.text)} strokeWidth={2.5} />
          </div>

          <p
            className={cn(
              "text-[30px] font-bold font-mono tracking-tight tabular-nums",
              isCredit ? "text-emerald-700" : "text-rose-600"
            )}
          >
            {cfg.sign}
            {formatMoney(tx.amount, currency as any)}
          </p>
          <p className="text-slate-400 text-sm mt-1 font-medium">{cfg.label}</p>

          {/* Status */}
          <div className="flex items-center gap-1.5 mt-3 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full">
            <CheckCircle2
              className="w-3.5 h-3.5 text-emerald-600"
              strokeWidth={2.5}
            />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
              Completed
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-slate-100" />

        {/* Details */}
        <div className="px-6 py-5 space-y-4 bg-slate-50/30">
          {detailRows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-start gap-4"
            >
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex-shrink-0 pt-0.5">
                {row.label}
              </span>
              <span
                className={cn(
                  "text-[13px] text-slate-900 text-right break-all leading-snug",
                  row.mono ? "font-mono" : "font-medium"
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Barcode */}
        <div className="px-6 py-5 bg-slate-50/30 border-t border-slate-100">
          <Barcode
            value={tx.id}
            className="w-full justify-center opacity-80"
          />
          <p className="text-center text-[10px] text-slate-400 font-mono tracking-widest mt-2 uppercase">
            {tx.id.slice(0, 24)}
          </p>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-2 bg-white flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Save Receipt
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
