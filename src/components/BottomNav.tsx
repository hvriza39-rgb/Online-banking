"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, CreditCard, ArrowUpRight, BarChart2, User,
} from "lucide-react";

export default function BottomNav({ isVerified }: { isVerified: boolean }) {
  const pathname = usePathname();

  const items = [
    { label: "Overview",  icon: Home,         href: "/dashboard"     },
    { label: "Card",      icon: CreditCard,   href: "/card"          },
    { label: "Transfer",  icon: ArrowUpRight, href: isVerified ? "/withdraw" : null },
    { label: "Analytics", icon: BarChart2,    href: "/transactions"  },
    // Change the grid to render MoreSheet as the last item
<div className="grid grid-cols-5 pb-safe">
  {items.slice(0, 4).map(({ label, icon: Icon, href }) => {
    // ... your existing map logic
  })}
  <MoreSheet />
</div>
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#e2f0ea] border-t border-[#c8dfd5] shadow-[0_-4px_16px_rgba(20,80,55,0.08)]">
      <div className="grid grid-cols-5 pb-safe">
        {items.map(({ label, icon: Icon, href }) => {
          const active = href ? pathname === href : false;
          const cls = `flex flex-col items-center gap-1 py-3 px-1 transition-colors ${
            active ? "text-[#1e7a52]" : "text-[#6a8c7a] hover:text-[#2d5042]"
          }`;
          const inner = (
            <>
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              <span className="text-[9px] font-semibold tracking-[0.08em] uppercase">{label}</span>
            </>
          );
          return href ? (
            <Link key={label} href={href} className={cls}>{inner}</Link>
          ) : (
            <span key={label} className={`${cls} opacity-40 cursor-not-allowed`}>{inner}</span>
          );
        })}
      </div>
    </nav>
  );
}
