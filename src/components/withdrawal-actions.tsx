"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface WithdrawalActionsProps {
  requestId: string;
}

export function WithdrawalActions({ requestId }: WithdrawalActionsProps) {
  const router  = useRouter();
  const [note, setNote]         = useState("");
  const [loading, setLoading]   = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const handle = async (action: "APPROVED" | "REJECTED") => {
    setLoading(action);
    setError(null);

    const res  = await fetch(`/api/withdrawals/${requestId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action, adminNote: note || undefined }),
    });
    const json = await res.json();

    setLoading(null);

    if (!res.ok) {
      setError(json.error ?? "Failed");
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-3">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Admin note (optional)"
        maxLength={200}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => handle("APPROVED")}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading === "APPROVED"
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <CheckCircle2 className="w-4 h-4" />}
          Approve
        </button>
        <button
          onClick={() => handle("REJECTED")}
          disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors disabled:opacity-50 border border-red-100"
        >
          {loading === "REJECTED"
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <XCircle className="w-4 h-4" />}
          Reject
        </button>
      </div>
    </div>
  );
}
