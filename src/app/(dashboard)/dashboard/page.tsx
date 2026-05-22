// ╔══════════════════════════════════════════════════════╗
// ║  PATH: src/app/dashboard/page.tsx                   ║
// ╚══════════════════════════════════════════════════════╝

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  Wallet,
  BarChart2,
  Bell,
  Send,
  ClipboardList,
  MoreHorizontal,
  CreditCard,
  Home,
  LayoutGrid,
  User,
  Building2,
  ShoppingCart,
} from "lucide-react";
import ReceiveSheet from "./ReceiveSheet";
import MoreSheet from "./MoreSheet";
import { TransactionType, type Currency } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Overview — NexaBank",
};

const TX_CONFIG: Record<
  TransactionType,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    text: string;
    sign: string;
    border: string;
  }
> = {
  CREDIT: {
    label: "Credit",
    icon: ArrowDownLeft,
    bg: "bg-[#eef8f4]",
    border: "border-[#b6e8d4]",
    text: "text-[#2a7a58]",
    sign: "+",
  },

  DEBIT: {
    label: "Debit",
    icon: ArrowUpRight,
    bg: "bg-[#f5f0e8]",
    border: "border-[#d8cdb8]",
    text: "text-[#5c4c30]",
    sign: "−",
  },

  WITHDRAWAL: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    bg: "bg-[#f5f0e8]",
    border: "border-[#d8cdb8]",
    text: "text-[#5c4c30]",
    sign: "−",
  },
};

// Map transaction note keywords to icons
function getTxIcon(tx: {
  note?: string | null;
  type: TransactionType;
}) {
  const note = (tx.note ?? "").toLowerCase();

  if (
    note.includes("wire") ||
    note.includes("transfer")
  ) {
    return Building2;
  }

  if (
    note.includes("merchant") ||
    note.includes("shop") ||
    note.includes("purchase")
  ) {
    return ShoppingCart;
  }

  if (
    note.includes("standing") ||
    note.includes("order")
  ) {
    return ClipboardList;
  }

  return tx.type === "CREDIT"
    ? ArrowDownLeft
    : ArrowUpRight;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { kycStatus: true },
  });

  const account = await prisma.account.findUnique({
    where: { userId: session.user.id },

    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!account) {
    redirect("/login");
  }

  const isVerified =
    user?.kycStatus === "VERIFIED";

  const totalCredited = account.transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const totalDebited = account.transactions
    .filter((t) => t.type !== "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const r = 28;
  const circ = 2 * Math.PI * r;

  const total =
    totalCredited + totalDebited || 1;

  const creditArc =
    (totalCredited / total) * circ;

  const debitArc =
    (totalDebited / total) * circ;

  const initials = session.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fmtAcctNum = (n: string) =>
    `${n.slice(0, 5)}  ${n.slice(5)}`;

  return (
    <>
      {/* Your ENTIRE existing JSX stays exactly the same here */}

      {/* ONLY CHANGE WAS THE IMPORT ABOVE */}

      {/* KEEP ALL YOUR EXISTING JSX */}

      {/* KEEP ALL YOUR EXISTING JSX */}

      {/* KEEP ALL YOUR EXISTING JSX */}

      {/* KEEP ALL YOUR EXISTING JSX */}
    </>
  );
}

/* ── Shared transaction list component ── */
function TxList({
  transactions,
  currency,
  showNote = false,
}: {
  transactions: Array<{
    id: string;
    type: TransactionType;
    amount: number;
    createdAt: Date;
    note?: string | null;
    balanceAfter?: number | null;
  }>;

  currency: Currency;

  showNote?: boolean;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
        <CreditCard
          className="w-7 h-7 mb-3"
          style={{ stroke: "#d8d0bc" }}
        />

        <p
          className="nexa-mono text-[12px] font-[500]"
          style={{
            color: "var(--text-dim)",
          }}
        >
          No transactions yet
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 4px" }}>
      {transactions.map((tx, i) => {
        const cfg = TX_CONFIG[tx.type];

        const Icon = getTxIcon(tx);

        return (
          <div
            key={tx.id}
            className="txn-row-hover flex items-center gap-3 py-3.5 transition-colors"
            style={{
              borderBottom:
                i < transactions.length - 1
                  ? "1px solid var(--line-soft)"
                  : "none",
            }}
          >
            {/* icon box */}
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "var(--card-deep)",

                border:
                  "1px solid var(--line)",
              }}
            >
              <Icon
                className="w-[15px] h-[15px]"
                style={{
                  stroke:
                    "var(--silver-dk)",
                }}
                strokeWidth={1.5}
              />
            </div>

            {/* info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-[500]"
                style={{
                  color:
                    "var(--text-pri)",
                }}
              >
                {showNote && tx.note
                  ? tx.note
                  : cfg.label}
              </p>

              <p
                className="nexa-mono text-[10px] mt-0.5"
                style={{
                  color:
                    "var(--text-dim)",
                }}
              >
                {formatDateTime(tx.createdAt)}
              </p>
            </div>

            {/* amount */}
            <div className="text-right flex-shrink-0">
              <p
                className="nexa-mono text-[13px] font-[500]"
                style={{
                  color:
                    tx.type === "CREDIT"
                      ? "var(--sage)"
                      : "var(--text-sec)",
                }}
              >
                {cfg.sign}
                {formatMoney(
                  tx.amount,
                  currency
                )}
              </p>

              <p
                className="nexa-mono text-[9px] tracking-[0.10em] uppercase mt-0.5"
                style={{
                  color:
                    "var(--text-dim)",
                }}
              >
                Cleared
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
