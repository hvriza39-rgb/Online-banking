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
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface SidebarProps {
  user: { name: string; email: string; role: string };
}

const userLinks = [
  { href: "/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
  { href: "/withdraw",     label: "Withdraw",    icon: ArrowDownToLine },
  { href: "/transactions", label: "Transactions", icon: ClipboardList },
];

const adminLinks = [
  { href: "/admin",             label: "Overview",    icon: LayoutDashboard },
  { href: "/admin/users",       label: "Users",       icon: Users },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname  = usePathname();
  const isAdmin   = user.role === "ADMIN";
  const links     = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-gray-100 h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">NexaBank</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
