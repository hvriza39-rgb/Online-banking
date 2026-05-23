"use client";

import { useState } from "react";
import { Loader2, KeyRound, RefreshCw, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserOption {
  id:    string;
  name:  string;
  email: string;
}

interface WithdrawalCodeFormProps {
  users: UserOption[];
}

export function WithdrawalCodeForm({ users }: WithdrawalCodeFormProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [generatedCode, setGeneratedCode]   = useState<string | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [copied, setCopied]                 = useState(false);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const generate = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    setGeneratedCode(null);

    const res  = await fetch("/api/admin/withdrawal-code", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId: selectedUserId }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) { setError(json.error ?? "Failed to generate code"); return; }
    setGeneratedCode(json.code);
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">

      {/* User select */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Select User
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => { setSelectedUserId(e.target.value); setGeneratedCode(null); setError(null); }}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
        >
          <option value="">— Choose a user —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!selectedUserId || loading}
        className={cn(
          "w-full py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2",
          selectedUserId && !loading
            ? "bg-[#1a1d27] hover:bg-[#23273a] text-white shadow-sm"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
          : generatedCode
            ? <><RefreshCw className="w-4 h-4" />Regenerate Code</>
            : <><KeyRound className="w-4 h-4" />Generate Code</>
        }
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Generated code display */}
      {generatedCode && selectedUser && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Code for {selectedUser.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{selectedUser.email}</p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
            >
              {copied
                ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" />Copied</>
                : <><Copy className="w-3 h-3" />Copy</>
              }
            </button>
          </div>

          <div className="flex items-center justify-center py-3 bg-white border border-slate-200 rounded-xl">
            <span className="font-mono text-2xl font-bold tracking-[0.3em] text-slate-900">
              {generatedCode}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Share this code securely with the user. It will be required to process their withdrawal requests.
          </p>
        </div>
      )}
    </div>
  );
}
