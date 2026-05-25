"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Send, MessageCircle, Users,
  CheckCircle2, RefreshCw, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

type SupportMessage = {
  id: string;
  sender: "USER" | "ADMIN";
  body: string;
  createdAt: string;
};

type SupportTicket = {
  id: string;
  subject: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; name?: string | null };
  messages?: SupportMessage[];
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function groupByDate(messages: SupportMessage[]) {
  const groups: { date: string; messages: SupportMessage[] }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.createdAt).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else groups.push({ date, messages: [msg] });
  });
  return groups;
}

function getInitials(name?: string | null, email?: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

export default function AdminSupportPage() {
  const [tickets, setTickets]           = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "CLOSED">("OPEN");
  const [loading, setLoading]           = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError]               = useState("");
  const [detailError, setDetailError]   = useState("");
  const [reply, setReply]               = useState("");
  const [replying, setReplying]         = useState(false);
  const bottomRef                       = useRef<HTMLDivElement>(null);
  const textareaRef                     = useRef<HTMLTextAreaElement>(null);

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const fetchTickets = useCallback(async (filter: "OPEN" | "CLOSED" = statusFilter, silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res  = await fetch(`/api/admin/support/tickets?status=${filter}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Failed to load tickets."); return; }
      setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusFilter]);

  const fetchTicketDetail = useCallback(async (id: string, silent = false) => {
    if (!silent) setDetailLoading(true);
    setDetailError("");
    try {
      const res  = await fetch(`/api/admin/support/tickets/${id}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setDetailError(data.error || "Failed to load ticket."); return; }
      const ticket = data?.ticket as SupportTicket | undefined;
      if (!ticket) { setDetailError("Ticket not found."); return; }
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
    } catch {
      setDetailError("Network error. Please try again.");
    } finally {
      if (!silent) setDetailLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchTickets(statusFilter); }, [fetchTickets, statusFilter]);

  // Poll ticket list every 10s
  useEffect(() => {
    const interval = setInterval(() => fetchTickets(statusFilter, true), 10_000);
    return () => clearInterval(interval);
  }, [fetchTickets, statusFilter]);

  // Poll selected ticket messages every 5s
  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(() => fetchTicketDetail(selectedId, true), 5_000);
    return () => clearInterval(interval);
  }, [fetchTicketDetail, selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    fetchTicketDetail(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.target.value);
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 120)}px`; }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }
  };

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim() || replying) return;
    setReplying(true);
    setDetailError("");
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ body: reply }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setDetailError(data.error || "Failed to send reply."); return; }
      setReply("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets(statusFilter);
    } catch {
      setDetailError("Network error. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async (nextStatus: "OPEN" | "CLOSED") => {
    if (!selectedTicket) return;
    setDetailError("");
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setDetailError(data.error || "Failed to update status."); return; }
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets(statusFilter);
    } catch {
      setDetailError("Network error. Please try again.");
    }
  };

  const grouped = groupByDate(selectedTicket?.messages ?? []);

  return (
    <div className="min-h-screen bg-[#eef1f8] p-5 sm:p-8 flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1a1d27]">
            Support
          </h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Review and respond to user messages.</p>
        </div>

        {/* Status filter toggle */}
        <div className="flex items-center gap-1 bg-white border border-[#e4e7ef] rounded-[13px] p-1 shadow-sm">
          {(["OPEN", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s); setSelectedId(null); }}
              className={cn(
                "px-4 py-1.5 rounded-[10px] text-[13px] font-semibold transition-all",
                statusFilter === s
                  ? s === "OPEN"
                    ? "bg-[#e6f7f3] text-[#16a37f]"
                    : "bg-[#f4f6fb] text-[#6b7280]"
                  : "text-[#9ca3af] hover:text-[#6b7280]"
              )}
            >
              {s === "OPEN" ? "Open" : "Closed"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">

        {/* ── LEFT: ticket list ── */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#e8ecf4] shadow-sm flex flex-col overflow-hidden" style={{ minHeight: "560px" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f3f8]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9ca3af]" />
              <p className="text-[14px] font-bold text-[#1a1d27]">Conversations</p>
            </div>
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin text-[#c4c9d4]" />
              : <span className="text-[11px] font-semibold text-[#9ca3af] bg-[#f4f6fb] px-2 py-0.5 rounded-full">
                  {tickets.length}
                </span>
            }
          </div>

          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="px-5 py-3 text-[12px] text-rose-500">{error}</div>
            )}
            {!loading && tickets.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-5">
                <MessageCircle className="w-7 h-7 text-[#e4e7ef] mb-3" />
                <p className="text-[13px] font-semibold text-[#9ca3af]">No {statusFilter.toLowerCase()} tickets</p>
              </div>
            )}

            {tickets.map((ticket) => {
              const isActive   = selectedId === ticket.id;
              const lastMsg    = ticket.messages?.[ticket.messages.length - 1];
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => handleSelect(ticket.id)}
                  className={cn(
                    "w-full text-left px-5 py-4 border-b border-[#f5f7fb] transition-colors",
                    isActive ? "bg-[#f0faf6]" : "hover:bg-[#fafbff]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#0f1117] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5">
                      {getInitials(ticket.user?.name, ticket.user?.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-[#1a1d27] truncate">
                          {ticket.user?.name || ticket.user?.email || "Unknown user"}
                        </p>
                        <span className="text-[10px] text-[#c4c9d4] flex-shrink-0">
                          {formatTime(ticket.updatedAt)}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#9ca3af] truncate mt-0.5">{ticket.subject}</p>
                      {lastMsg && (
                        <p className="text-[11px] text-[#c4c9d4] truncate mt-0.5">
                          {lastMsg.sender === "ADMIN" ? "You: " : ""}{lastMsg.body}
                        </p>
                      )}
                    </div>
                    {/* Status dot */}
                    {ticket.status === "OPEN"
                      ? <Circle className="w-2 h-2 fill-[#16a37f] text-[#16a37f] flex-shrink-0 mt-1.5" />
                      : <Circle className="w-2 h-2 fill-[#e4e7ef] text-[#e4e7ef] flex-shrink-0 mt-1.5" />
                    }
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: chat thread ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e8ecf4] shadow-sm flex flex-col overflow-hidden" style={{ minHeight: "560px" }}>

          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-5">
              <div className="w-14 h-14 rounded-2xl bg-[#f4f6fb] border border-[#e4e7ef] flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#c4c9d4]" />
              </div>
              <p className="text-[14px] font-semibold text-[#9ca3af]">Select a conversation</p>
              <p className="text-[12px] text-[#c4c9d4] mt-1">Choose a ticket on the left to view messages.</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#f0f3f8]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0f1117] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {getInitials(selectedTicket.user?.name, selectedTicket.user?.email)}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a1d27]">
                      {selectedTicket.user?.name || selectedTicket.user?.email || "Unknown user"}
                    </p>
                    <p className="text-[11px] text-[#9ca3af]">{selectedTicket.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border",
                    selectedTicket.status === "OPEN"
                      ? "bg-[#e6f7f3] text-[#16a37f] border-[#16a37f]/20"
                      : "bg-[#f4f6fb] text-[#9ca3af] border-[#e4e7ef]"
                  )}>
                    {selectedTicket.status === "OPEN" ? "● Open" : "Closed"}
                  </span>
                  {selectedTicket.status === "OPEN" ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("CLOSED")}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#9ca3af] border border-[#e4e7ef] px-3 py-1.5 rounded-full hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("OPEN")}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#9ca3af] border border-[#e4e7ef] px-3 py-1.5 rounded-full hover:border-[#16a37f]/30 hover:text-[#16a37f] hover:bg-[#f0faf6] transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {detailLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-[#c4c9d4]" />
                  </div>
                )}
                {detailError && (
                  <div className="text-[12px] text-rose-500 text-center">{detailError}</div>
                )}

                {!detailLoading && (selectedTicket.messages ?? []).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-[13px] text-[#9ca3af]">No messages yet.</p>
                  </div>
                )}

                {grouped.map(({ date, messages: dayMsgs }) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-[#f0f3f8]" />
                      <span className="text-[11px] text-[#c4c9d4] font-medium">
                        {formatDateDivider(dayMsgs[0].createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-[#f0f3f8]" />
                    </div>

                    <div className="space-y-3">
                      {dayMsgs.map((msg) => {
                        const isAdmin = msg.sender === "ADMIN";
                        return (
                          <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
                            {!isAdmin && (
                              <div className="w-7 h-7 rounded-full bg-[#0f1117] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-0.5 self-end">
                                {getInitials(selectedTicket.user?.name, selectedTicket.user?.email)}
                              </div>
                            )}
                            <div className={cn("max-w-[72%] flex flex-col", isAdmin ? "items-end" : "items-start")}>
                              <div className={cn(
                                "px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed",
                                isAdmin
                                  ? "bg-[#0f1117] text-white rounded-br-sm"
                                  : "bg-[#f4f6fb] text-[#1a1d27] border border-[#e8ecf4] rounded-bl-sm"
                              )}>
                                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                              </div>
                              <span className="text-[10px] text-[#c4c9d4] mt-1 px-1">
                                {isAdmin ? "You · " : ""}{formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[#f0f3f8] px-4 py-3">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={reply}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Reply to this user… (Enter to send)"
                    className="flex-1 resize-none bg-[#f9fafb] border border-[#e4e7ef] rounded-[13px] px-4 py-2.5 text-[13.5px] text-[#1a1d27] placeholder-[#c4c9d4] focus:outline-none focus:border-[#16a37f]/40 focus:bg-white transition-all"
                    style={{ minHeight: "42px", maxHeight: "120px" }}
                  />
                  <button
                    type="button"
                    onClick={handleReply}
                    disabled={!reply.trim() || replying}
                    className="w-10 h-10 rounded-[13px] bg-[#0f1117] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#1a1d27] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
                  >
                    {replying
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
                <p className="text-[10px] text-[#c4c9d4] mt-2 px-1">Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
