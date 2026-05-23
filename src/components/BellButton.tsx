// components/BellButton.tsx
// Drop-in replacement for the static bell in the dashboard header.
// Fetches unread count on mount and shows a red badge.
"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export function BellButton() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => setUnread(d.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  return (
    <Link href="/dashboard/notifications" className="relative">
      <div className="w-9 h-9 rounded-full bg-[#f0f7f4] border border-[#c8dfd5] flex items-center justify-center shadow-sm hover:border-[#4daa80] transition-colors">
        <Bell className="w-4 h-4 text-[#2d5042]" strokeWidth={1.5} />
      </div>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b52b3a] flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>
        </span>
      )}
    </Link>
  );
}
