"use client";

import { useState } from "react";
import { MoreHorizontal, X, Settings, ShieldCheck, HelpCircle, LogOut, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";

const ITEMS = [
  { icon: Settings,    label: "Settings",          sub: "Account preferences",     href: "/settings" },
  { icon: ShieldCheck, label: "KYC Verification",  sub: "Identity & documents",    href: "/kyc"      },
  { icon: Bell,        label: "Notifications",      sub: "Alerts & preferences",    href: "/notifications" },
  { icon: HelpCircle,  label: "Help & Support",     sub: "FAQs and contact us",     href: "/support"  },
  { icon: LogOut,      label: "Sign Out",           sub: "Log out of your account", href: "/logout",  danger: true },
];

export default function MoreSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-2 py-3 px-1 rounded-[12px] bg-white border border-[#e4e7ec] shadow-sm hover:border-[#d1d5db] transition-all active:scale-[0.97]"
      >
        <div className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center">
          <MoreHorizontal className="w-4 h-4 text-[#6b7280]" strokeWidth={1.8} />
        </div>
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#6b7280]">More</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-[24px] shadow-2xl max-w-lg mx-auto overflow-hidden">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#e4e7ec]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f3f8]">
            <p className="text-[16px] font-semibold text-[#111827]">More Options</p>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-[#e5e7eb] transition-colors"
            >
              <X className="w-4 h-4 text-[#6b7280]" />
            </button>
          </div>

          {/* Items */}
          <div className="px-4 py-3 flex flex-col gap-1">
            {ITEMS.map(({ icon: Icon, label, sub, href, danger }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3.5 px-3 py-3.5 rounded-[14px] hover:bg-[#f5f6f8] transition-colors active:scale-[0.99] group"
              >
                <div className={`w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0 ${
                  danger ? "bg-red-50 border border-red-100" : "bg-[#f5f6f8] border border-[#e4e7ec]"
                }`}>
                  <Icon className={`w-4.5 h-4.5 ${danger ? "text-[#dc2626]" : "text-[#374151]"}`} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold leading-none ${danger ? "text-[#dc2626]" : "text-[#111827]"}`}>
                    {label}
                  </p>
                  <p className="text-[11px] text-[#9ca3af] mt-1">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Safe area */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
