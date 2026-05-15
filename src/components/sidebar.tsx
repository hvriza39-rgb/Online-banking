"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ArrowDownToLine, ClipboardList,
  Users, LogOut, Wallet, ShieldCheck, ShieldAlert, Menu, X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  user:       { name: string; email: string; role: string };
  kycStatus?: string;
}

const adminLinks = [
  { href: "/admin",             label: "Overview",    icon: LayoutDashboard, locked: false, highlight: false },
  { href: "/admin/users",       label: "Users",       icon: Users,           locked: false, highlight: false },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownToLine, locked: false, highlight: false },
];

export function Sidebar({ user, kycStatus }: SidebarProps) {
  const pathname   = usePathname();
  const isAdmin    = user.role === "ADMIN";
  const isVerified = kycStatus === "VERIFIED";
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const userLinks = [
    { href: "/dashboard",    label: "Dashboard",       icon: LayoutDashboard, locked: false,       highlight: false },
    { href: "/withdraw",     label: "Withdraw",         icon: ArrowDownToLine, locked: !isVerified, highlight: false },
    { href: "/transactions", label: "Transactions",     icon: ClipboardList,   locked: false,       highlight: false },
    ...(!isVerified
      ? [{ href: "/kyc", label: "Verify Identity", icon: ShieldAlert, locked: false, highlight: true }]
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
      "w-64 flex-shrink-0 flex flex-col h-screen bg-[#0d1421] text-slate-400 relative overflow-hidden",
      // On mobile it's fixed and slides in; on lg+ it's static in the layout
      "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
      "lg:static lg:translate-x-0 lg:z-auto",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
    )}>
      {/* Subtle dot-grid texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

      {/* Logo */}
      <div className="relative flex items-center justify-between gap-3 px-6 h-[70px] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Wallet className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-white text-[15px] tracking-tight">NexaBank</span>
            {isAdmin && (
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
                <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Admin</span>
              </div>
            )}
          </div>
        </div>

        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="relative flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3 mb-3">
          {isAdmin ? "Management" : "Banking"}
        </p>

        {links.map(({ href, label, icon: Icon, locked, highlight }) => {
          const active = isActive(href);

          if (locked) {
            return (
              <div key={href}
                title="Complete KYC verification to unlock"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 cursor-not-allowed opacity-40 select-none">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                {label}
                <span className="ml-auto text-[9px] bg-slate-800 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-slate-700">
                  Locked
                </span>
              </div>
            );
          }

          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150",
                active
                  ? "bg-blue-600/20 text-blue-300"
                  : highlight
                  ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                active     ? "bg-blue-600/30 text-blue-300"
                : highlight ? "text-amber-400"
                : "text-slate-500"
              )}>
                <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
              </div>
              {label}
              {highlight && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              )}
              {active && !highlight && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="relative px-3 pb-5 border-t border-white/[0.06] pt-3 space-y-1">
        {!isAdmin && (
          <div className={cn(
            "flex items-center gap-2 mx-3 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold",
            isVerified
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          )}>
            {isVerified
              ? <><ShieldCheck className="w-3 h-3" /> Identity Verified</>
              : <><ShieldAlert className="w-3 h-3" /> KYC Required</>
            }
          </div>
        )}

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-slate-200 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-white/[0.05] hover:text-red-400 transition-all group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
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
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 h-14 bg-[#0d1421] border-b border-white/[0.06]">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
            <Wallet className="w-[15px] h-[15px] text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-white text-[15px] tracking-tight">NexaBank</span>
        </div>
      </header>

      {/* ── Backdrop ───────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Sidebar ────────────────────────────────────── */}
      {sidebarContent}
    </>
  );
}
