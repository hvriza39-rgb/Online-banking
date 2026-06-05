"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !session?.user?.id) {
      signOut({ callbackUrl: "/login" });
    }
  }, [session, status]);

  return <>{children}</>;
}
