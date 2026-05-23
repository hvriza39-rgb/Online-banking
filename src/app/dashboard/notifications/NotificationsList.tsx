// app/dashboard/notifications/NotificationsList.tsx
"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownLeft,
  MessageCircle, Bell, Trash2, CheckCheck, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType =
  | "KYC_APPROVED" | "KYC_REJECTED"
  | "WITHDRAWAL_APPROVED" | "WITHDRAWAL_REJECTED"
  | "SUPPORT_MESSAGE" | "ACCOUNT_CREDITED" | "ACCOUNT_DEBITED";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

const TYPE_CONFIG: Record<NotificationType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
}> = {
  KYC_APPROVED:        { icon: ShieldCheck,    bg: "bg-[#edf7f5]", border: "border-[#a8dbd4]", text: "text-[#0f7a6e]" },
  KYC_REJECTED:        { icon: ShieldAlert,    bg: "bg-[#faeef0]", border: "border-[#e8b8be]", text: "text-[#b52b3a]" },
  WITHDRAWAL_APPROVED: { icon: ArrowUpRight,   bg: "bg-[#edf7f5]", border: "border-[#a8dbd4]", text: "text-[#0f7a6e]" },
  WITHDRAWAL_REJECTED: { icon: ArrowUpRight,   bg: "bg-[#faeef0]", border: "border-[#e8b8be]", text: "text-[#b52b3a]" },
  SUPPORT_MESSAGE:     { icon: MessageCircle,  bg: "bg-[#e4f2ec]", border: "border-[#c8dfd5]", text: "text-[#1e7a52]" },
  ACCOUNT_CREDITED:    { icon: ArrowDownLeft,  bg: "bg-[#edf7f5]", border: "border-[#a8dbd4]", text: "text-[#0f7a6e]" },
  ACCOUNT_DEBITED:     { icon: CreditCard,     bg: "bg-[#fff8ec]", border: "border-[#f0d9a0]", text: "text-[#c47a00]" },
};

export function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismiss = async (id: string) => {
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center mb-4">
          <Bell className="w-7 h-7 text-[#c8dfd5]" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] font-semibold text-[#6a8c7a]">No notifications yet</p>
        <p className="text-[11px] text-[#6a8c7a] mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Toolbar ── */}
      {unread > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#6a8c7a]">
            <span className="font-bold text-[#0f2419]">{unread}</span> unread
          </span>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1e7a52] hover:text-[#155c3a] transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>
      )}

      {/* ── List ── */}
      <div className="bg-[#f2f9f6] rounded-2xl border border-[#c8dfd5] shadow-sm overflow-hidden">
        {notifications.map((n, i) => {
          const cfg  = TYPE_CONFIG[n.type];
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={cn(
                "flex items-start gap-3 px-5 py-4 border-b border-[#f0f7f4] last:border-0 transition-colors",
                !n.read ? "bg-[#edf7f5] hover:bg-[#e4f2ec] cursor-pointer" : "hover:bg-[#f0f7f4]"
              )}
            >
              {/* Icon */}
              <div className={cn("w-9 h-9 rounded-[11px] border flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg, cfg.border)}>
                <Icon className={cn("w-4 h-4", cfg.text)} strokeWidth={2} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-[12px] leading-snug", n.read ? "font-medium text-[#2d5042]" : "font-bold text-[#0f2419]")}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#1e7a52] flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] text-[#6a8c7a] mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-[#6a8c7a] font-mono mt-1.5">
                  {formatDateTime(new Date(n.createdAt))}
                </p>
              </div>

              {/* Dismiss */}
              <button
                onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#c8dfd5] hover:text-[#b52b3a] hover:bg-[#faeef0] transition-colors mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
