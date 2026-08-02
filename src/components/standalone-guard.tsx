"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function StandaloneGuard() {
  const router = useRouter();

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
