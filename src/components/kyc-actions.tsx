"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function KycActions({ kycId, userId }: { kycId: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const handle = async (action: "APPROVED" | "REJECTED") => {
    setLoading(action); setError(null);
    const res  = await fetch(`/api/admin/kyc`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId, action }),
    });
    const json = await res.json();
    setLoading(null);
    if (!res.ok) { setError(json.error ?? "Failed"); return; }
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => handle("APPROVED")} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm shadow-emerald-100"
        >
          {loading === "APPROVED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Approve
        </button>
        <button
          onClick={() => handle("REJECTED")} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-sm font-semibold border border-rose-200 transition-all disabled:opacity-50"
        >
          {loading === "REJECTED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Reject
        </button>
      </div>
    </div>
  );
}
