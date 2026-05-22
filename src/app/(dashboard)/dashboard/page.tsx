// ╔══════════════════════════════════════════════════════╗
// ║  PATH: src/app/dashboard/page.tsx                   ║
// ╚══════════════════════════════════════════════════════╝

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatMoney, formatDateTime, cn } from "@/lib/utils";
import {
  ArrowDownLeft, ArrowUpRight, ShieldAlert, ArrowRight,
  Wallet, BarChart2, Bell, Send, ClipboardList,
  MoreHorizontal, CreditCard, Home, LayoutGrid, User,
  Building2, ShoppingCart,
} from "lucide-react";
import ReceiveSheet from "./ReceiveSheet";
import MoreSheet from "./MoreSheet";
import { TransactionType } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = { title: "Account Overview — NexaBank" };

const TX_CONFIG: Record<TransactionType, {
  label: string; icon: React.ElementType;
  bg: string; text: string; sign: string; border: string;
}> = {
  CREDIT:     { label: "Credit",     icon: ArrowDownLeft, bg: "bg-[#eef8f4]", border: "border-[#b6e8d4]", text: "text-[#2a7a58]", sign: "+" },
  DEBIT:      { label: "Debit",      icon: ArrowUpRight,  bg: "bg-[#f5f0e8]", border: "border-[#d8cdb8]", text: "text-[#5c4c30]", sign: "−" },
  WITHDRAWAL: { label: "Withdrawal", icon: ArrowUpRight,  bg: "bg-[#f5f0e8]", border: "border-[#d8cdb8]", text: "text-[#5c4c30]", sign: "−" },
};

// Map transaction note keywords to icons
function getTxIcon(tx: { note?: string | null; type: TransactionType }) {
  const note = (tx.note ?? "").toLowerCase();
  if (note.includes("wire") || note.includes("transfer")) return Building2;
  if (note.includes("merchant") || note.includes("shop") || note.includes("purchase")) return ShoppingCart;
  if (note.includes("standing") || note.includes("order")) return ClipboardList;
  return tx.type === "CREDIT" ? ArrowDownLeft : ArrowUpRight;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true },
  });

  const account = await prisma.account.findUnique({
    where:   { userId: session.user.id },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 8 } },
  });

  if (!account) redirect("/login");

  const isVerified = user?.kycStatus === "VERIFIED";

  const totalCredited = account.transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  const totalDebited = account.transactions
    .filter((t) => t.type !== "CREDIT")
    .reduce((s, t) => s + t.amount, 0);

  // Donut chart math — r=28, circumference ≈ 175.9 (matches reference SVG viewBox 80×80)
  const r = 28;
  const circ = 2 * Math.PI * r; // ≈ 175.9
  const total = totalCredited + totalDebited || 1;
  const creditArc = (totalCredited / total) * circ;
  const debitArc  = (totalDebited  / total) * circ;

  const initials = session.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const fmtAcctNum = (n: string) => `${n.slice(0, 5)}  ${n.slice(5)}`;

  return (
    <>
      {/* ── Fonts + global styles ─────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg:        #e8e0d0;
          --surface:   #ddd5c3;
          --card:      #f2ece0;
          --card-deep: #e8e0d0;
          --line:      #c8bea8;
          --line-soft: #d8d0bc;
          --gold:      #8a6e28;
          --gold-lt:   #b89448;
          --gold-dk:   #6a5018;
          --silver:    #8a9088;
          --silver-dk: #586058;
          --text-pri:  #1c1408;
          --text-sec:  #5c4c30;
          --text-dim:  #9a8a68;
          --sage:      #2a7a58;
          --rust:      #a02010;
        }

        .nexa-body    { font-family: 'IBM Plex Sans', sans-serif; }
        .nexa-display { font-family: 'Playfair Display', serif; }
        .nexa-mono    { font-family: 'IBM Plex Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-header { animation: fadeIn  0.35s ease 0.00s both; }
        .anim-1      { animation: fadeUp  0.45s ease 0.05s both; }
        .anim-2      { animation: fadeUp  0.45s ease 0.12s both; }
        .anim-3      { animation: fadeUp  0.45s ease 0.19s both; }
        .anim-4      { animation: fadeUp  0.45s ease 0.26s both; }
        .anim-5      { animation: fadeUp  0.45s ease 0.33s both; }
        .anim-6      { animation: fadeUp  0.45s ease 0.40s both; }

        /* Action buttons */
        .action-btn { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .action-btn:hover  { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(80,50,10,0.16); }
        .action-btn:active { transform: translateY(0); }

        /* Disabled action */
        .action-disabled { opacity: 0.4; cursor: not-allowed; }

        /* Transaction rows */
        .txn-row-hover:hover { background: rgba(200,190,168,0.18); }

        /* Balance card shimmer overlay */
        .balance-card-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 55%);
          border-radius: inherit;
          pointer-events: none;
        }

        /* Section cards */
        .nexa-card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(80,50,10,0.10);
        }
        .nexa-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--line-soft);
        }
        .nexa-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-pri);
          letter-spacing: 0.02em;
        }
        .nexa-card-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: var(--silver-dk);
          cursor: pointer;
        }

        /* Detail rows inside cards */
        .detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--line-soft);
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-dim);
          font-weight: 500;
          margin-bottom: 4px;
        }
        .detail-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: var(--text-pri);
          letter-spacing: 0.08em;
        }
        .detail-value-lg {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 15px;
          letter-spacing: 0.12em;
          color: var(--text-pri);
        }

        /* Pills */
        .pill {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 20px;
          font-weight: 600;
        }
        .pill-active {
          background: rgba(42,122,88,0.10);
          border: 1px solid rgba(42,122,88,0.28);
          color: var(--sage);
        }
        .pill-pending {
          background: rgba(180,83,9,0.10);
          border: 1px solid rgba(180,83,9,0.25);
          color: #b45309;
        }
        .pill-usd {
          background: rgba(138,110,40,0.10);
          border: 1px solid rgba(138,110,40,0.25);
          color: var(--gold);
        }

        /* Transaction summary dots */
        .txn-dot-in  { background: var(--sage);   box-shadow: 0 0 6px rgba(42,122,88,0.40); }
        .txn-dot-out { background: var(--silver);  }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
      `}</style>

      <div className="nexa-body min-h-screen" style={{ background: "var(--bg)" }}>

        {/* ── Header ──────────────────────────────────── */}
        <div className="anim-header flex items-start justify-between px-6 pt-14 pb-5"
             style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
          <div>
            <p className="nexa-display text-[12px] font-[500] uppercase tracking-[0.22em]" style={{ color: "var(--gold)" }}>
              NexaBank
            </p>
            <h1 className="nexa-display text-[22px] font-[400] tracking-[0.01em] mt-0.5" style={{ color: "var(--text-pri)" }}>
              Account Overview
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.06)", border: "1px solid var(--line)" }}>
              <Bell className="w-4 h-4" style={{ stroke: "var(--text-sec)" }} strokeWidth={1.5} />
            </button>
            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center select-none"
                 style={{
                   background: "linear-gradient(135deg, var(--gold-dk), var(--gold-lt))",
                   border: "1.5px solid var(--gold-dk)",
                   boxShadow: "0 2px 6px rgba(0,0,0,0.20)",
                 }}>
              <span className="nexa-display text-[13px] font-[600]" style={{ color: "#f5ead0" }}>{initials}</span>
            </div>
          </div>
        </div>

        {/* ── Main scroll area ─────────────────────────── */}
        <div className="px-5 pt-5 pb-28 flex flex-col gap-3 max-w-[420px] mx-auto
                        lg:max-w-none lg:grid lg:grid-cols-3 lg:gap-4 lg:px-8 lg:pb-10">

          {/* ══ COLUMN 1 ════════════════════════════════ */}
          <div className="flex flex-col gap-3">

            {/* ── KYC banner ── */}
            {!isVerified && (
              <Link href="/kyc"
                    className="anim-1 flex items-center gap-3 rounded-[14px] p-4 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg,#fef9ec,#fef3d0)", border: "1px solid rgba(234,179,8,0.33)" }}>
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0"
                     style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.30)" }}>
                  <ShieldAlert className="w-4 h-4" style={{ color: "#b45309" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-[600] leading-snug" style={{ color: "#78350f" }}>Verify your identity</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "#92400e" }}>
                    Complete KYC to unlock transfers and get your account number.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: "#b45309" }} />
              </Link>
            )}

            {/* ── Balance card ── */}
            <div className={cn("anim-1 balance-card-inner relative rounded-[14px] p-6 overflow-hidden",
                               !isVerified && "anim-2")}
                 style={{
                   background: "var(--card)",
                   border: "1px solid var(--line)",
                   borderRadius: "14px",
                   boxShadow: "0 2px 10px rgba(80,50,10,0.10)",
                 }}>

              {/* top: label + balance + status chip */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="detail-label mb-1.5">Main Balance</p>
                  <p className="nexa-mono leading-none" style={{ fontSize: "32px", fontWeight: 500, color: "var(--text-pri)", letterSpacing: "-0.02em" }}>
                    <span style={{ fontSize: "14px", color: "var(--gold)", fontWeight: 400, verticalAlign: "super", marginRight: "2px" }}>$</span>
                    {/* Strip leading $ and cents for split rendering */}
                    {formatMoney(account.balance, account.currency)
                      .replace(/^\$/, "")
                      .replace(/\.\d+$/, "")}
                    <span style={{ fontSize: "18px", color: "var(--text-sec)" }}>
                      .{String(account.balance.toFixed(2)).split(".")[1] ?? "00"}
                    </span>
                  </p>
                </div>
                {isVerified ? (
                  <span className="pill pill-active mt-1">● Active</span>
                ) : (
                  <span className="pill pill-pending mt-1">● Pending</span>
                )}
              </div>

              {/* divider */}
              <div style={{ height: "1px", background: "var(--line-soft)", marginBottom: "16px" }} />

              {/* footer: name + acct + currency badge */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="nexa-display text-[15px] font-[400] leading-none" style={{ color: "var(--text-pri)" }}>
                    {session.user.name}
                  </p>
                  <p className="nexa-mono text-[11px] tracking-[0.15em] mt-[5px]" style={{ color: "var(--text-dim)" }}>
                    {isVerified && account.accountNumber
                      ? fmtAcctNum(account.accountNumber)
                      : "— Pending KYC —"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-[5px]"
                     style={{ background: "rgba(138,110,40,0.10)", border: "1px solid rgba(138,110,40,0.25)" }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <span className="nexa-mono text-[10px] font-[600] tracking-[0.12em]" style={{ color: "var(--gold)" }}>
                    {account.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Quick actions ── */}
            <div className="anim-3 grid grid-cols-4 gap-2.5">
              {/* Send */}
              {isVerified ? (
                <Link href="/withdraw"
                      className="action-btn flex flex-col items-center gap-2 py-3 px-1 rounded-[12px]"
                      style={{ background: "var(--card)", border: "1px solid var(--line)", boxShadow: "0 2px 10px rgba(80,50,10,0.10)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                       style={{ background: "rgba(28,20,8,0.07)" }}>
                    <Send className="w-4 h-4" style={{ stroke: "var(--text-pri)" }} strokeWidth={2} />
                  </div>
                  <span className="nexa-mono text-[9px] font-[500] tracking-[0.1em] uppercase" style={{ color: "var(--text-sec)" }}>Send</span>
                </Link>
              ) : (
                <div className="action-disabled flex flex-col items-center gap-2 py-3 px-1 rounded-[12px]"
                     style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(28,20,8,0.07)" }}>
                    <Send className="w-4 h-4" style={{ stroke: "var(--text-pri)" }} strokeWidth={2} />
                  </div>
                  <span className="nexa-mono text-[9px] font-[500] tracking-[0.1em] uppercase" style={{ color: "var(--text-sec)" }}>Send</span>
                </div>
              )}

              {/* Receive */}
              <ReceiveSheet
                name={session.user.name}
                accountNumber={isVerified && account.accountNumber ? fmtAcctNum(account.accountNumber) : null}
                sortCode="20 — 14 — 53"
                currency={account.currency}
                isVerified={isVerified}
              />

              {/* History */}
              <Link href="/transactions"
                    className="action-btn flex flex-col items-center gap-2 py-3 px-1 rounded-[12px]"
                    style={{ background: "var(--card)", border: "1px solid var(--line)", boxShadow: "0 2px 10px rgba(80,50,10,0.10)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                     style={{ background: "rgba(138,144,136,0.12)" }}>
                  <ClipboardList className="w-4 h-4" style={{ stroke: "var(--silver-dk)" }} strokeWidth={2} />
                </div>
                <span className="nexa-mono text-[9px] font-[500] tracking-[0.1em] uppercase" style={{ color: "var(--text-sec)" }}>History</span>
              </Link>

              {/* More */}
              <MoreSheet />
            </div>

            {/* ── Account Details ── */}
            <div className="anim-4 nexa-card">
              <div className="nexa-card-header">
                <span className="nexa-card-title">Account Details</span>
                <span className="nexa-card-link">Manage →</span>
              </div>

              {/* Account number row */}
              <div className="detail-row">
                <div>
                  <p className="detail-label">Account Number</p>
                  {isVerified && account.accountNumber ? (
                    <p className="detail-value-lg">{fmtAcctNum(account.accountNumber)}</p>
                  ) : (
                    <p className="detail-value" style={{ color: "var(--text-dim)" }}>— Pending KYC —</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="pill pill-usd">{account.currency}</span>
                  {isVerified
                    ? <span className="pill pill-active">Active</span>
                    : <span className="pill pill-pending">Pending</span>}
                </div>
              </div>

              {/* Account type row */}
              <div className="detail-row">
                <div>
                  <p className="detail-label">Account Type</p>
                  <p className="detail-value">Current Account</p>
                </div>
                <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>Personal</span>
              </div>

              {/* Sort code row */}
              <div className="detail-row">
                <div>
                  <p className="detail-label">Sort Code</p>
                  <p className="detail-value">20 — 14 — 53</p>
                </div>
                <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>NexaBank PLC</span>
              </div>
            </div>

          </div>

          {/* ══ COLUMN 2 ════════════════════════════════ */}
          <div className="flex flex-col gap-3">

            {/* ── Transaction Summary ── */}
            <div className="anim-3 nexa-card">
              <div className="nexa-card-header">
                <span className="nexa-card-title">Transaction Summary</span>
                <Link href="/transactions" className="nexa-card-link">View all →</Link>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {/* Credits row */}
                <div className="flex items-center justify-between py-2.5"
                     style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 txn-dot-in" />
                    <span className="nexa-mono text-[12px] font-[500] tracking-[0.06em]"
                          style={{ color: "var(--text-sec)" }}>Total Credits</span>
                  </div>
                  <span className="nexa-mono text-[13px] font-[500] tracking-[0.04em]"
                        style={{ color: "var(--sage)" }}>
                    +{formatMoney(totalCredited, account.currency)}
                  </span>
                </div>
                {/* Debits row */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0 txn-dot-out" />
                    <span className="nexa-mono text-[12px] font-[500] tracking-[0.06em]"
                          style={{ color: "var(--text-sec)" }}>Total Debits</span>
                  </div>
                  <span className="nexa-mono text-[13px] font-[500] tracking-[0.04em]"
                        style={{ color: "var(--text-sec)" }}>
                    −{formatMoney(totalDebited, account.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Spending Overview ── */}
            <div className="anim-4 nexa-card">
              <div className="nexa-card-header">
                <span className="nexa-card-title">Spending Overview</span>
                <Link href="/transactions" className="nexa-card-link">Details →</Link>
              </div>
              <div style={{ padding: "16px 20px 20px" }}>
                <div className="flex items-center gap-6">
                  {/* Donut — matches reference SVG exactly */}
                  <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
                    <svg viewBox="0 0 80 80" width="80" height="80">
                      {/* track */}
                      <circle cx="40" cy="40" r={r} fill="none" stroke="#d8d0bc" strokeWidth="10"/>
                      {/* credits arc */}
                      {totalCredited > 0 && (
                        <circle cx="40" cy="40" r={r} fill="none" stroke="#2a7a58" strokeWidth="10"
                          strokeDasharray={`${creditArc} ${circ - creditArc}`}
                          strokeDashoffset="0"
                          strokeLinecap="butt"
                          transform="rotate(-90 40 40)"
                          style={{ filter: "drop-shadow(0 0 3px rgba(42,122,88,0.40))" }}
                        />
                      )}
                      {/* debits arc */}
                      {totalDebited > 0 && (
                        <circle cx="40" cy="40" r={r} fill="none" stroke="#8a9088" strokeWidth="10"
                          strokeDasharray={`${debitArc} ${circ - debitArc}`}
                          strokeDashoffset={`-${creditArc}`}
                          strokeLinecap="butt"
                          transform="rotate(-90 40 40)"
                        />
                      )}
                    </svg>
                    {/* centre label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="nexa-mono text-[10px] font-[600]" style={{ color: "var(--text-pri)" }}>
                        {/* abbreviated balance */}
                        {account.balance >= 1_000_000
                          ? `$${(account.balance / 1_000_000).toFixed(1)}m`
                          : account.balance >= 1_000
                          ? `$${(account.balance / 1_000).toFixed(0)}k`
                          : `$${account.balance}`}
                      </span>
                      <span className="nexa-mono text-[8px] mt-0.5" style={{ color: "var(--text-dim)" }}>balance</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-[10px] flex-1">
                    {[
                      { color: "#2a7a58", dot: "txn-dot-in",  label: "Credits", val: totalCredited },
                      { color: "#8a9088", dot: "txn-dot-out", label: "Debits",  val: totalDebited  },
                    ].map(({ color, dot, label, val }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-[7px] h-[7px] rounded-full flex-shrink-0", dot)} />
                          <span className="text-[11px]" style={{ color: "var(--text-sec)" }}>{label}</span>
                        </div>
                        <span className="nexa-mono text-[12px] font-[500]" style={{ color: "var(--text-pri)" }}>
                          {formatMoney(val, account.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Recent Transactions (mobile / col-2 on desktop) ── */}
            <div className="anim-5 nexa-card lg:hidden">
              <div className="nexa-card-header">
                <span className="nexa-card-title">Recent Transactions</span>
                <Link href="/transactions" className="nexa-card-link">See all →</Link>
              </div>
              <TxList transactions={account.transactions.slice(0, 5)} currency={account.currency} />
            </div>

          </div>

          {/* ══ COLUMN 3 — desktop only ═════════════════ */}
          <div className="hidden lg:flex flex-col gap-3">
            <div className="anim-4 nexa-card flex-1">
              <div className="nexa-card-header">
                <span className="nexa-card-title">Recent Transactions</span>
                <Link href="/transactions" className="nexa-card-link">See all →</Link>
              </div>
              <TxList transactions={account.transactions.slice(0, 8)} currency={account.currency} showNote />
            </div>
          </div>

        </div>

        {/* ── Bottom Nav ───────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 pb-safe"
             style={{
               background: "var(--surface)",
               borderTop: "1px solid var(--line)",
               boxShadow: "0 -4px 20px rgba(80,50,10,0.15)",
               paddingBottom: "20px",
               paddingTop: "12px",
             }}>
          {[
            { label: "Home",      icon: Home,         href: "/dashboard",                active: true  },
            { label: "Accounts",  icon: LayoutGrid,   href: "/accounts",                 active: false },
            { label: "Transfer",  icon: ArrowUpRight, href: isVerified ? "/send" : null, active: false },
            { label: "Analytics", icon: BarChart2,    href: "/transactions",             active: false },
            { label: "Profile",   icon: User,         href: "/profile",                  active: false },
          ].map(({ label, icon: Icon, href, active }) => {
            const cls = "flex flex-col items-center gap-1 cursor-pointer px-1";
            const color = active ? "var(--sage)" : "var(--text-dim)";
            const inner = (
              <>
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} style={{ stroke: color }} />
                <span className="nexa-mono text-[9px] font-[500] tracking-[0.08em] uppercase"
                      style={{ color }}>{label}</span>
              </>
            );
            return href ? (
              <Link key={label} href={href} className={cls}>{inner}</Link>
            ) : (
              <span key={label} className={`${cls} opacity-40 cursor-not-allowed`}>{inner}</span>
            );
          })}
        </nav>

      </div>
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
  currency: string;
  showNote?: boolean;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
        <CreditCard className="w-7 h-7 mb-3" style={{ stroke: "#d8d0bc" }} />
        <p className="nexa-mono text-[12px] font-[500]" style={{ color: "var(--text-dim)" }}>No transactions yet</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 4px" }}>
      {transactions.map((tx, i) => {
        const cfg  = TX_CONFIG[tx.type];
        const Icon = getTxIcon(tx);
        return (
          <div key={tx.id}
               className="txn-row-hover flex items-center gap-3 py-3.5 transition-colors"
               style={{ borderBottom: i < transactions.length - 1 ? "1px solid var(--line-soft)" : "none" }}>
            {/* icon box */}
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                 style={{ background: "var(--card-deep)", border: "1px solid var(--line)" }}>
              <Icon className="w-[15px] h-[15px]" style={{ stroke: "var(--silver-dk)" }} strokeWidth={1.5} />
            </div>

            {/* info */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-[500]" style={{ color: "var(--text-pri)" }}>
                {showNote && tx.note ? tx.note : cfg.label}
              </p>
              <p className="nexa-mono text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                {formatDateTime(tx.createdAt)}
              </p>
            </div>

            {/* amount */}
            <div className="text-right flex-shrink-0">
              <p className="nexa-mono text-[13px] font-[500]"
                 style={{ color: tx.type === "CREDIT" ? "var(--sage)" : "var(--text-sec)" }}>
                {cfg.sign}{formatMoney(tx.amount, currency)}
              </p>
              <p className="nexa-mono text-[9px] tracking-[0.10em] uppercase mt-0.5"
                 style={{ color: "var(--text-dim)" }}>Cleared</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
