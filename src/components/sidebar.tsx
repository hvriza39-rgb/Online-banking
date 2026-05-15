"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ArrowDownToLine, ClipboardList,
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
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownToLine, locked: false, highlight: false, pending: false },
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
    { href: "/withdraw",     label: "Send",                icon: ArrowDownToLine, locked: !isVerified, highlight: false, pending: false },
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
      "w-64 flex-shrink-0 flex flex-col h-screen bg-white border-r border-[#e4e7ef] text-[#6b7280]",
      "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
      "lg:static lg:translate-x-0 lg:z-auto",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
    )}>

      {/* Logo — flex-shrink-0 keeps it from being squeezed */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 h-[70px] border-b border-[#e4e7ef]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0f1117] rounded-xl flex items-center justify-center">
            <Wallet className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-[#0f1117] text-[15px] tracking-tight">NexaBank</span>
            {isAdmin && (
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-[#16a37f]" />
                <span className="text-[10px] text-[#16a37f] font-semibold uppercase tracking-wider">Admin</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#9ca3af] hover:text-[#0f1117] hover:bg-[#f4f6fb] transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav — flex-1 + overflow-y-auto: scrolls internally, never pushes footer down */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#c4c9d4] px-3 mb-3">
          {isAdmin ? "Management" : "Banking"}
        </p>

        {links.map(({ href, label, icon: Icon, locked, highlight, pending }) => {
          const active = isActive(href);

          if (locked) {
            return (
              <div key={href}
                title="Complete KYC verification to unlock"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-[#c4c9d4] cursor-not-allowed select-none">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                {label}
                <span className="ml-auto text-[9px] bg-[#f4f6fb] text-[#c4c9d4] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-[#e4e7ef]">
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
                  ? "bg-[#e6f7f3] text-[#16a37f]"
                  : highlight
                  ? "text-amber-600 hover:bg-amber-50"
                  : "text-[#6b7280] hover:bg-[#f4f6fb] hover:text-[#0f1117]"
              )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                active      ? "bg-[#16a37f]/10 text-[#16a37f]"
                : highlight ? "text-amber-500"
                : "text-[#9ca3af]"
              )}>
                <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
              </div>
              {label}
              {highlight && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              )}
              {active && !highlight && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#16a37f] flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — flex-shrink-0 keeps it pinned at the bottom always */}
      <div className="flex-shrink-0 px-3 pb-5 border-t border-[#e4e7ef] pt-3 space-y-1">
        {!isAdmin && (
          <div className={cn(
            "flex items-center gap-2 mx-3 mb-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold",
            isVerified
              ? "bg-[#e6f7f3] text-[#16a37f] border border-[#16a37f]/20"
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
          <div className="w-8 h-8 rounded-full bg-[#f4f6fb] border border-[#e4e7ef] flex items-center justify-center text-xs font-bold text-[#0f1117] flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#0f1117] truncate">{user.name}</p>
            <p className="text-[11px] text-[#9ca3af] truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#9ca3af] hover:bg-rose-50 hover:text-rose-500 transition-all group">
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
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 h-14 bg-white border-b border-[#e4e7ef]">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl text-[#6b7280] hover:text-[#0f1117] hover:bg-[#f4f6fb] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0f1117] flex items-center justify-center">
            <Wallet className="w-[15px] h-[15px] text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[#0f1117] text-[15px] tracking-tight">NexaBank</span>
        </div>
      </header>

      {/* ── Backdrop ───────────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Sidebar ────────────────────────────────────── */}
      {sidebarContent}
    </>
  );
}
