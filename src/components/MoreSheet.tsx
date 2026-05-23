"use client";

import { useState } from "react";
import { MoreHorizontal, X, Settings, ShieldCheck, HelpCircle, LogOut, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { handleSignOut } from "@/app/dashboard/settings/actions";

const ITEMS = [
  { icon: Settings,    label: "Settings",         sub: "Account preferences",  href: "/dashboard/settings" },
  { icon: ShieldCheck, label: "KYC Verification", sub: "Identity & documents", href: "/kyc"                },
  { icon: Bell,        label: "Notifications",     sub: "Alerts & preferences", href: "/dashboard/notifications"      },
  { icon: HelpCircle,  label: "Help & Support",    sub: "FAQs and contact us",  href: "/support"            },
];

export default function MoreSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger — matches BottomNav style */}
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 py-3 px-1 transition-colors text-[#6a8c7a] hover:text-[#2d5042]"
      >
        <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={1.5} />
        <span className="text-[9px] font-semibold tracking-[0.08em] uppercase">More</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0f2419]/25 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-[#f2f9f6] rounded-t-[24px] shadow-2xl max-w-lg mx-auto overflow-hidden">

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#c8dfd5]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ede6]">
            <div>
              <Image
                src="/nexabank-logo.svg"
                alt="NexaBank"
                width={120}
                height={38}
                className="h-9 w-auto"
              />
              <p className="text-[15px] font-semibold text-[#0f2419] mt-1.5"
                 style={{ fontFamily: "'Playfair Display', serif" }}>
                More Options
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center hover:bg-[#d8ede6] transition-colors"
            >
              <X className="w-4 h-4 text-[#2d5042]" />
            </button>
          </div>

          {/* Items */}
          <div className="px-4 py-3 flex flex-col gap-1">
            {ITEMS.map(({ icon: Icon, label, sub, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3.5 px-3 py-3.5 rounded-[14px] hover:bg-[#e4f2ec] transition-colors active:scale-[0.99] group"
              >
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0 bg-[#e4f2ec] border border-[#c8dfd5]">
                  <Icon className="w-4.5 h-4.5 text-[#1e7a52]" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold leading-none text-[#0f2419]">{label}</p>
                  <p className="text-[11px] text-[#6a8c7a] mt-1">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-[#c8dfd5] group-hover:text-[#4daa80] transition-colors" />
              </Link>
            ))}

            {/* Sign Out */}
            <button
              onClick={() => handleSignOut()}
              className="flex items-center gap-3.5 px-3 py-3.5 rounded-[14px] hover:bg-rose-50 transition-colors active:scale-[0.99] group w-full"
            >
              <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0 bg-rose-50 border border-rose-100">
                <LogOut className="w-4.5 h-4.5 text-rose-500" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-semibold leading-none text-rose-500">Sign Out</p>
                <p className="text-[11px] text-[#6a8c7a] mt-1">Log out of your account</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-rose-200 group-hover:text-rose-400 transition-colors" />
            </button>
          </div>

          {/* Safe area */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
