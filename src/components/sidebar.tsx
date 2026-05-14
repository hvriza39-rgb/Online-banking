"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ClipboardList,
  Users,
  LogOut,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  user: { name: string; email: string; role: string };
}

const userLinks = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/withdraw",     label: "Withdraw",     icon: ArrowDownToLine },
  { href: "/transactions", label: "Transactions", icon: ClipboardList },
];

const adminLinks = [
  { href: "/admin",             label: "Overview",    icon: LayoutDashboard },
  { href: "/admin/users",       label: "Users",       icon: Users },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin  = user.role === "ADMIN";
  const links    = isAdmin ? adminLinks : userLinks;

  const isActive = (href: string) =>
    href === "/admin" || href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-[#0d1421] text-slate-400 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-6 h-[70px] border-b border-white/[0.06]">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Wallet className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
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

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3 mb-3">
          {isAdmin ? "Management" : "Banking"}
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150",
                active
                  ? "bg-blue-600/20 text-blue-300 shadow-sm"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                active ? "bg-blue-600/30 text-blue-300" : "text-slate-500"
              )}>
                <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
              </div>
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="relative px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
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
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-white/[0.05] hover:text-red-400 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          Sign out
        </button>
      </div>
    </aside>
  );
}
