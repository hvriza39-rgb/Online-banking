"use client";

import { useState } from "react";
import { useWebAuthn } from "@/hooks/useWebAuthn";

export function BiometricSetup() {
  const { registerBiometric } = useWebAuthn();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleEnable() {
    setState("loading");
    try {
      await registerBiometric("My Phone");
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl bg-[#f0f7f4] border border-[#1e7a52]/20 p-4 text-sm text-[#1e7a52] font-medium">
        ✓ Biometric login enabled for this device
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#f0f7f4] border border-[#1e7a52]/20 p-4">
      <p className="text-sm text-[#0f2419] font-medium mb-1">Enable Face ID / Fingerprint</p>
      <p className="text-xs text-[#0f2419]/60 mb-3">
        Sign in faster on this device using your biometrics.
      </p>
      <button
        onClick={handleEnable}
        disabled={state === "loading"}
        className="w-full py-2 rounded-lg bg-[#1e7a52] text-white text-sm font-medium disabled:opacity-50"
      >
        {state === "loading" ? "Setting up…" : "Enable Biometrics"}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-500 mt-2">Setup failed. Your device may not support this.</p>
      )}
    </div>
  );
      }
