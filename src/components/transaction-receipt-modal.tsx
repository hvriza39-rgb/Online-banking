"use client";

import { useEffect, useRef } from "react";
import { X, ArrowDownLeft, ArrowUpRight, CheckCircle2, Download } from "lucide-react";
import { cn, formatMoney, formatDateTime } from "@/lib/utils";
import { TransactionType } from "@prisma/client";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

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

export function TransactionReceiptModal({ tx, currency, onClose }: Props) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!tx || !barcodeRef.current) return;
    import("jsbarcode").then(({ default: JsBarcode }) => {
      JsBarcode(barcodeRef.current!, tx.id.slice(0, 20).toUpperCase(), {
        format:       "CODE128",
        width:        2,
        height:       50,
        displayValue: true,
        fontSize:     12,
        margin:       8,
        background:   "#ffffff",
        lineColor:    "#0f172a",
        fontOptions:  "bold",
      });
    });
  }, [tx?.id]);

  useEffect(() => {
    if (!tx) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tx, onClose]);

  if (!tx) return null;

  const cfg = TX_CONFIG[tx.type];
  const Icon = cfg.icon;
  const isCredit = tx.type === "CREDIT";
  const receiptUrl = typeof window !== "undefined"
    ? `${window.location.origin}/transactions?id=${tx.id}`
    : "";

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
    const HEADER_H = 240;
    const FOOTER_H = 140;
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

    // Logo container
    const cx = W / 2;
    const cy = 58;
    ctx.fillStyle = "#0f2419";
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();

    // Hexagon
    ctx.fillStyle = "#1a6648";
    ctx.beginPath();
    const r = 20;
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
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", cx, cy);

    // Brand
    ctx.fillStyle = "#0f2419";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("NexaBank", cx, cy + 44);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText("OFFICIAL RECEIPT", cx, cy + 60);

    // Amount
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 32px monospace";
    ctx.fillText(`${cfg.sign}${formatMoney(tx.amount, currency as any)}`, cx, 158);
    ctx.fillStyle = "#64748b";
    ctx.font = "13px sans-serif";
    ctx.fillText(cfg.label, cx, 180);

    // Status pill
    const pillW = 120, pillH = 28, pillX = (W - pillW) / 2, pillY = 192;
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
    ctx.moveTo(PAD, 238);
    ctx.lineTo(W - PAD, 238);
    ctx.stroke();

    // Rows
    let y = 262;
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

    // Canvas barcode (thin, realistic)
    const barcodeY = y + 16;
    const code = tx.id.slice(0, 24).toUpperCase();
    let bx = PAD + 20;
    const barHeight = 55;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      const w = (char % 3) + 1;
      const gap = char % 2 === 0;
      if (!gap && bx < W - PAD - 20) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(bx, barcodeY + (barHeight - 50), w, 50);
      }
      bx += w + 1;
    }

    // Barcode text
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(code, cx, barcodeY + barHeight + 14);

    // Canvas QR pattern
    const qrSize = 80;
    const qrX = W - PAD - qrSize;
    const qrY = barcodeY - 10;
    const qrCells = 16;
    const cellSize = qrSize / qrCells;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    for (let row = 0; row < qrCells; row++) {
      for (let col = 0; col < qrCells; col++) {
        const idx = (row * qrCells + col) % code.length;
        const val = code.charCodeAt(idx);
        if (val % 3 !== 0) {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(qrX + col * cellSize, qrY + row * cellSize, cellSize, cellSize);
        }
      }
    }
    // QR finder patterns (corners)
    ctx.fillStyle = "#0f172a";
    [0, qrCells - 7].forEach((ox) => {
      [0, qrCells - 7].forEach((oy) => {
        if (ox === 0 && oy === qrCells - 7) return; // skip one corner for style
        ctx.fillRect(qrX + ox * cellSize, qrY + oy * cellSize, 7 * cellSize, 7 * cellSize);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(qrX + (ox + 1) * cellSize, qrY + (oy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(qrX + (ox + 2) * cellSize, qrY + (oy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
      });
    });

    // Footer
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NexaBank · Secure Banking", cx, H - 24);

    // Blob download (iOS fix)
    const fileName = `nexabank-receipt-${tx.id.slice(0, 8)}.png`;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
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
        <div className={cn("h-1.5 w-full", isCredit ? "bg-emerald-600" : "bg-rose-500")} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Header with logo */}
        <div className="flex flex-col items-center px-6 pt-8 pb-3">
          <div className="relative w-[72px] h-[72px] mb-3">
            <div className="absolute inset-0 rounded-2xl bg-[#0f2419] flex items-center justify-center shadow-lg">
              <Image
                src="/nexabank-logo.svg"
                alt="NexaBank"
                width={44}
                height={44}
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
          </div>
          <p className="text-[16px] font-bold text-slate-900 tracking-wide">
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

        {/* Barcode + QR */}
        <div className="px-6 py-5 bg-slate-50/30 border-t border-slate-100">
          <div className="flex items-center justify-between gap-4">
            {/* Barcode */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Barcode
              </span>
              <svg ref={barcodeRef} className="w-full max-w-[220px]" />
            </div>

            <div className="w-px h-20 bg-slate-100" />

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                QR Code
              </span>
              <QRCodeSVG
                value={receiptUrl}
                size={90}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
              <span className="text-[9px] text-slate-400 text-center max-w-[90px] leading-tight">
                Scan to verify
              </span>
            </div>
          </div>
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
