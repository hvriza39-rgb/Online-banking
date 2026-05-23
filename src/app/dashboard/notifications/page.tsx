// app/dashboard/notifications/page.tsx
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NotificationsList } from "./NotificationsList";
import { Bell } from "lucide-react";

export const metadata: Metadata = { title: "Notifications — NexaBank" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take:    50,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f0f7f4] font-sans pb-24">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pt-12 pb-5 border-b border-[#c8dfd5] bg-[#e2f0ea]">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#1e7a52]"
             style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            NexaBank
          </p>
          <h1 className="text-[22px] font-semibold text-[#0f2419] tracking-tight mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Notifications
          </h1>
        </div>
        <div className="relative mt-1">
          <div className="w-9 h-9 rounded-full bg-[#f0f7f4] border border-[#c8dfd5] flex items-center justify-center shadow-sm">
            <Bell className="w-4 h-4 text-[#2d5042]" strokeWidth={1.5} />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b52b3a] flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pt-5 max-w-lg mx-auto">
        <NotificationsList initialNotifications={notifications} />
      </div>
    </div>
  );
}
