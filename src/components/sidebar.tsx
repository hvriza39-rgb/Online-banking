"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ArrowUpToLine, ClipboardList,
  Users, LogOut, Wallet, ShieldCheck, ShieldAlert, Clock, MessageSquare, Menu, X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  user:       { name: string; email: string; role: string };
  kycStatus?: string;
}

const adminLinks = [
  { href: "/admin",             label: "Overview",    icon: LayoutDashboard, locked: false, highlight: false, pending: false },
  { href: "/admin/users",       label: "Users",       icon: Users,           locked: false, highlight: false, pending: false },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpToLine,   locked: false, highlight: false, pending: false },
  { href: "/admin/kyc",         label: "Kyc",         icon: ShieldCheck,     locked: false, highlight: false, pending: false },
  { href: "/admin/support",     label: "Support",     icon: MessageSquare,   locked: false, highlight: false, pending: false },
];

export function Sidebar({ user, kycStatus }: SidebarProps) {
  const pathname   = usePathname();
  const isAdmin    = user.role === "ADMIN";
  const isVerified = kycStatus === "VERIFIED";
  const isPending  = kycStatus === "PENDING";
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const userLinks = [
    { href: "/dashboard",    label: "Overview",            icon: LayoutDashboard, locked: false,       highlight: false, pending: false },
    { href: "/withdraw",     label: "Send",                icon: ArrowUpToLine,   locked: !isVerified, highlight: false, pending: false },
    { href: "/transactions", label: "History",             icon: ClipboardList,   locked: false,       highlight: false, pending: false },
    { href: "/support",      label: "Support",             icon: MessageSquare,   locked: false,       highlight: false, pending: false },
    ...(!isVerified && !isPending
      ? [{ href: "/kyc", label: "Verify Identity",      icon: ShieldAlert, locked: false, highlight: true,  pending: false }]
      : []
    ),
    ...(isPending
      ? [{ href: "/kyc", label: "Pending Verification", icon: Clock,       locked: false, highlight: false, pending: true  }]
      : []
    ),
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const isActive = (href: string) =>
    href === "/admin" || href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  const sidebarContent = (
    <aside className={cn(
      "w-64 flex-shrink-0 flex flex-col h-screen [height:100dvh] bg-[#f2f9f6] border-r border-[#c8dfd5] text-[#2d5042]",
      "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
      "lg:static lg:translate-x-0 lg:z-auto",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
    )}>

      {/* Logo */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 h-[70px] border-b border-[#c8dfd5]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #1a6648, #3daa7a)" }}>
            <Wallet className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-[#0f2419] text-[15px] tracking-tight">NexaBank</span>
            {isAdmin && (
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-[#1e7a52]" />
                <span className="text-[10px] text-[#1e7a52] font-semibold uppercase tracking-wider">Admin</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#6a8c7a] hover:text-[#0f2419] hover:bg-[#e4f2ec] transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a8c8b8] px-3 mb-3">
          {isAdmin ? "Management" : "Banking"}
        </p>

        {links.map(({ href, label, icon: Icon, locked, highlight, pending }) => {
          const active = isActive(href);

          if (locked) {
            return (
              <div key={href}
                title="Complete KYC verification to unlock"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-[#a8c8b8] cursor-not-allowed select-none">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                {label}
                <span className="ml-auto text-[9px] bg-[#e4f2ec] text-[#a8c8b8] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#c8dfd5]">
                  Locked
                </span>
              </div>
            );
          }

          if (pending) {
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-amber-600 hover:bg-amber-50 transition-all duration-150">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-500">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                {label}
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              </Link>
            );
          }

          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150",
                active
                  ? "bg-[#e4f2ec] text-[#1e7a52]"
                  : highlight
                  ? "text-amber-600 hover:bg-amber-50"
                  : "text-[#2d5042] hover:bg-[#e4f2ec] hover:text-[#0f2419]"
              )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                active      ? "bg-[#1e7a52]/10 text-[#1e7a52]"
                : highlight ? "text-amber-500"
                : "text-[#6a8c7a]"
              )}>
                <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
              </div>
              {label}
              {highlight && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              )}
              {active && !highlight && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1e7a52] flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 pb-5 border-t border-[#c8dfd5] pt-3 space-y-1">
        {!isAdmin && (
          <div className={cn(
            "flex items-center gap-2 mx-3 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold",
            isVerified
              ? "bg-[#e4f2ec] text-[#1e7a52] border border-[#1e7a52]/20"
              : isPending
              ? "bg-amber-50 text-amber-600 border border-amber-200"
              : "bg-amber-50 text-amber-600 border border-amber-200"
          )}>
            {isVerified
              ? <><ShieldCheck className="w-3 h-3" /> Identity Verified</>
              : isPending
              ? <><Clock className="w-3 h-3" /> Pending Verification</>
              : <><ShieldAlert className="w-3 h-3" /> KYC Required</>
            }
          </div>
        )}

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center text-xs font-bold text-[#1e7a52] flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#0f2419] truncate">{user.name}</p>
            <p className="text-[11px] text-[#6a8c7a] truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#6a8c7a] hover:bg-rose-50 hover:text-rose-500 transition-all group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-rose-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 h-14 bg-[#e2f0ea] border-b border-[#c8dfd5]">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl text-[#2d5042] hover:text-[#0f2419] hover:bg-[#d8ede6] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
               style={{ background: "linear-gradient(135deg, #1a6648, #3daa7a)" }}>
            <Wallet className="w-[15px] h-[15px] text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[#0f2419] text-[15px] tracking-tight">NexaBank</span>
        </div>
      </header>

      {/* ── Backdrop ───────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-[#0f2419]/25 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {sidebarContent}
    </>
  );
}
