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

/* Generate a dense barcode pattern from transaction ID */
function Barcode({ value, className }: { value: string; className?: string }) {
  // Create more bars by combining pairs of chars
  const pairs = [];
  for (let i = 0; i < value.length - 1; i += 2) {
    pairs.push(value.slice(i, i + 2));
  }

  const bars = pairs.map((pair, i) => {
    const sum = pair.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const width = (sum % 4) + 1;
    const height = 60 + (sum % 20); // varying heights like real barcodes
    const isGap = sum % 5 === 0;
    return { width: isGap ? 2 : width, isGap, height, key: i };
  });

  return (
    <div className={cn("flex items-end gap-0 h-16 justify-center", className)}>
      {bars.map((bar) =>
        bar.isGap ? (
          <div key={bar.key} style={{ width: bar.width, height: bar.height }} className="bg-transparent" />
        ) : (
          <div
            key={bar.key}
            style={{ width: bar.width, height: bar.height }}
            className="bg-slate-900"
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

  // Balance After REMOVED from here
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
    ...(tx.reference ? [{ label: "Reference", value: tx.reference, mono: true }] : []),
  ];

  const handleDownload = () => {
    const scale = 3;
    const W = 420;
    const PAD = 32;
    const ROW_H = 42;
    const HEADER_H = 230;
    const FOOTER_H = 120;
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

    // Logo container circle
    const cx = W / 2;
    const cy = 55;
    ctx.fillStyle = "#0f2419";
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    // Hexagon inside circle
    ctx.fillStyle = "#1a6648";
    ctx.beginPath();
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
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", cx, cy);

    // Brand name
    ctx.fillStyle = "#0f2419";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("NexaBank", cx, cy + 38);

    // Official Receipt
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText("OFFICIAL RECEIPT", cx, cy + 54);

    // Amount
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px monospace";
    ctx.fillText(
      `${cfg.sign}${formatMoney(tx.amount, currency as any)}`,
      cx,
      148
    );

    // Type
    ctx.fillStyle = "#64748b";
    ctx.font = "13px sans-serif";
    ctx.fillText(cfg.label, cx, 170);

    // Status pill
    const pillW = 120;
    const pillH = 28;
const handleDownload = () => {
  const scale = 3;
  const W = 420;
  const PAD = 32;
  const ROW_H = 42;
  const HEADER_H = 230;
  const FOOTER_H = 120;
  const H = HEADER_H + detailRows.length * ROW_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // ── Background ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // ── Top accent ──
  ctx.fillStyle = isCredit ? "#059669" : "#e11d48";
  ctx.fillRect(0, 0, W, 5);

  // ── Logo container ──
  const cx = W / 2;
  const cy = 55;
  ctx.fillStyle = "#0f2419";
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.fill();

  // Hexagon
  ctx.fillStyle = "#1a6648";
  ctx.beginPath();
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

  // N
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", cx, cy);

  // Brand
  ctx.fillStyle = "#0f2419";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("NexaBank", cx, cy + 38);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px sans-serif";
  ctx.fillText("OFFICIAL RECEIPT", cx, cy + 54);

  // ── Amount ──
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 32px monospace";
  ctx.fillText(`${cfg.sign}${formatMoney(tx.amount, currency as any)}`, cx, 148);
  ctx.fillStyle = "#64748b";
  ctx.font = "13px sans-serif";
  ctx.fillText(cfg.label, cx, 170);

  // ── Status pill ──
  const pillW = 120, pillH = 28, pillX = (W - pillW) / 2, pillY = 182;
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

  // ── Divider ──
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, 228);
  ctx.lineTo(W - PAD, 228);
  ctx.stroke();

  // ── Detail rows ──
  let y = 252;
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
    ctx.beginPath();
    ctx.moveTo(PAD, y + 12);
    ctx.lineTo(W - PAD, y + 12);
    ctx.stroke();

    y += ROW_H;
  });

  // ── Barcode ──
  const barcodeY = y + 20;
  const pairs: string[] = [];
  for (let i = 0; i < tx.id.length - 1; i += 2) {
    pairs.push(tx.id.slice(i, i + 2));
  }
  let bx = PAD;
  pairs.forEach((pair) => {
    const sum = pair.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const width = (sum % 4) + 1;
    const isGap = sum % 5 === 0;
    const height = 50 + (sum % 20);
    if (!isGap) {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(bx, barcodeY + (60 - height), width, height);
    }
    bx += isGap ? 2 : width;
  });

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(tx.id.slice(0, 24).toUpperCase(), cx, barcodeY + 72);

  // ── Footer ──
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "10px sans-serif";
  ctx.fillText("NexaBank · Secure Banking", cx, H - 24);

  // ── FIX: Use blob URL instead of data URL for iOS compatibility ──
  const fileName = `nexabank-receipt-${tx.id.slice(0, 8)}.png`;

  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // iOS Safari needs the link in the DOM
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  }, "image/png");
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
        <div className="flex flex-col items-center px-6 pt-7 pb-3">
          {/* Logo container */}
          <div className="relative w-16 h-16 mb-3">
            <div className="absolute inset-0 rounded-2xl bg-[#0f2419] flex items-center justify-center shadow-md">
              <Image
                src="/nexabank-logo.svg"
                alt="NexaBank"
                width={40}
                height={40}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          </div>
          <p className="text-[15px] font-bold text-slate-900 tracking-wide">
            NexaBank
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.25em] mt-0.5 font-semibold">
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
        <div className="px-6 py-6 bg-slate-50/30 border-t border-slate-100">
          <Barcode
            value={tx.id}
            className="w-full justify-center opacity-90"
          />
          <p className="text-center text-[10px] text-slate-400 font-mono tracking-[0.15em] mt-3 uppercase">
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
