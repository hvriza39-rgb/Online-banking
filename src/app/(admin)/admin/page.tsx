'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Users, MessageSquare, Send, X, ChevronRight,
  CheckCircle, XCircle, ArrowUpToLine, Search,
  Edit, Loader2, Bell, ShieldAlert, Landmark,
  Clock, KeyRound, InboxIcon, CheckCircle2,
  RefreshCw, Circle, MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'CLOSED';
  updatedAt: string;
  createdAt: string;
  user?: { id: string; email: string; name?: string | null };
  messages?: { id: string; sender: 'USER' | 'ADMIN'; body: string; createdAt: string }[];
}

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  termMonths: number;
  status: string;
  note: string | null;
  createdAt: string;
  user: { name?: string; email?: string };
}

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  note?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  user: { name?: string; email?: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function countUnreadMessages(tickets: Ticket[]): number {
  let total = 0;
  for (const ticket of tickets) {
    if (ticket.status === 'CLOSED') continue;
    const msgs = ticket.messages ?? [];
    const lastAdminIdx = msgs.map(m => m.sender).lastIndexOf('ADMIN');
    total += msgs.filter((m, i) => m.sender === 'USER' && i > lastAdminIdx).length;
  }
  return total;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDate(messages: NonNullable<Ticket['messages']>) {
  const groups: { date: string; messages: typeof messages }[] = [];
  messages.forEach(msg => {
    const date = new Date(msg.createdAt).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === date) last.messages.push(msg);
    else groups.push({ date, messages: [msg] });
  });
  return groups;
}

function getInitials(name?: string | null, email?: string) {
  if (name) return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

// ── Withdrawal actions ────────────────────────────────────────────────────────
function WithdrawalActionsInline({ requestId, onSuccess }: { requestId: string; onSuccess: () => void }) {
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);

  const handle = async (action: 'APPROVED' | 'REJECTED') => {
    setLoading(action); setError(null);
    const res  = await fetch(`/api/admin/withdrawals/${requestId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNote: note || undefined }),
    });
    const json = await res.json();
    setLoading(null);
    if (!res.ok) { setError(json.error ?? 'Failed'); return; }
    setDone(true); onSuccess();
  };

  if (done) return <p className="text-xs text-[#1e7a52] font-semibold text-center py-1">✓ Processed</p>;

  return (
    <div className="space-y-3">
      <input value={note} onChange={e => setNote(e.target.value)}
        placeholder="Admin note (optional — visible to user)" maxLength={200}
        className="w-full px-4 py-2.5 rounded-xl border border-[#c8dfd5] bg-[#e4f2ec] text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#1e7a52]/20 focus:border-[#1e7a52] transition-all text-[#0f2419] placeholder-[#6a8c7a]"
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => handle('APPROVED')} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1e7a52] hover:bg-[#155c3a] text-white text-sm font-semibold transition-all disabled:opacity-50">
          {loading === 'APPROVED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
          Approve
        </button>
        <button onClick={() => handle('REJECTED')} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-sm font-semibold border border-rose-200 transition-all disabled:opacity-50">
          {loading === 'REJECTED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle size={16} />}
          Reject
        </button>
      </div>
    </div>
  );
}

// ── Withdrawal code generator ─────────────────────────────────────────────────
function WithdrawalCodeSection({ users }: { users: any[] }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [code, setCode]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!selectedUserId) return;
    setLoading(true); setError(''); setCode(null);
    try {
      const res  = await fetch('/api/admin/withdrawal-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCode(data.code);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const copy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound size={15} className="text-[#6a8c7a]" />
        <span className="text-[13px] font-semibold text-[#2d5042] uppercase tracking-wider">Withdrawal Code Generator</span>
      </div>
      <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl p-5">
        <p className="text-[12px] text-[#6a8c7a] mb-4 leading-relaxed">
          Generate a unique security code for a user. They must enter this code when submitting a withdrawal for it to be processed immediately.
        </p>
        <div className="space-y-3">
          <select value={selectedUserId} onChange={e => { setSelectedUserId(e.target.value); setCode(null); setError(''); }}
            className="w-full px-4 py-2.5 rounded-xl border border-[#c8dfd5] bg-[#e4f2ec] text-sm text-[#0f2419] outline-none focus:bg-white focus:border-[#1e7a52] transition-all">
            <option value="">Select a user…</option>
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
          </select>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          {code && (
            <div onClick={copy}
              className="flex items-center justify-between bg-[#e4f2ec] border border-[#c8dfd5] rounded-xl px-4 py-3 cursor-pointer hover:bg-[#d8ede6] transition-colors group">
              <span className="font-mono text-lg font-bold text-[#0f2419] tracking-[0.2em]">{code}</span>
              <span className="text-[11px] font-semibold text-[#6a8c7a] group-hover:text-[#1e7a52] transition-colors">
                {copied ? '✓ Copied' : 'Copy'}
              </span>
            </div>
          )}
          <button onClick={generate} disabled={!selectedUserId || loading}
            className="w-full py-2.5 rounded-xl bg-[#0f2419] hover:bg-[#1e7a52] text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound size={15} />}
            {code ? 'Regenerate Code' : 'Generate Code'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Loan actions ──────────────────────────────────────────────────────────────
function LoanActionsInline({ loanId, onSuccess }: { loanId: string; onSuccess: () => void }) {
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);
  const [result, setResult]   = useState<'APPROVED' | 'REJECTED' | null>(null);

  const handle = async (action: 'approve' | 'reject') => {
    setLoading(action); setError(null);
    const res  = await fetch(`/api/loans/${action}/${loanId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note || undefined }),
    });
    const json = await res.json();
    setLoading(null);
    if (!res.ok) { setError(json.error ?? 'Failed'); return; }
    setResult(action === 'approve' ? 'APPROVED' : 'REJECTED');
    setDone(true); onSuccess();
  };

  if (done) return (
    <p className={cn('text-xs font-semibold text-center py-1', result === 'APPROVED' ? 'text-[#1e7a52]' : 'text-rose-500')}>
      {result === 'APPROVED' ? '✓ Loan Approved — Funds Disbursed' : '✕ Loan Rejected'}
    </p>
  );

  return (
    <div className="space-y-3">
      <input value={note} onChange={e => setNote(e.target.value)}
        placeholder="Admin note (optional — visible to user)" maxLength={200}
        className="w-full px-4 py-2.5 rounded-xl border border-[#c8dfd5] bg-[#e4f2ec] text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#1e7a52]/20 focus:border-[#1e7a52] transition-all text-[#0f2419] placeholder-[#6a8c7a]"
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => handle('approve')} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1e7a52] hover:bg-[#155c3a] text-white text-sm font-semibold transition-all disabled:opacity-50">
          {loading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
          Approve
        </button>
        <button onClick={() => handle('reject')} disabled={!!loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-sm font-semibold border border-rose-200 transition-all disabled:opacity-50">
          {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle size={16} />}
          Reject
        </button>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'users' | 'withdrawals' | 'loans'>('chat');

  // Withdrawals
  const [pendingVerification, setPendingVerification] = useState<Withdrawal[]>([]);
  const [pending, setPending]     = useState<Withdrawal[]>([]);
  const [processed, setProcessed] = useState<Withdrawal[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  // Loans
  const [loans, setLoans]           = useState<Loan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(true);

  // Users
  const [users, setUsers]           = useState<any[]>([]);
  const [search, setSearch]         = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Support — full power
  const [tickets, setTickets]           = useState<Ticket[]>([]);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [ticketError, setTicketError]       = useState('');
  const [detailError, setDetailError]       = useState('');
  const [reply, setReply]   = useState('');
  const [replying, setReplying] = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedTicket = useMemo(
    () => tickets.find(t => t.id === selectedId) ?? null,
    [tickets, selectedId]
  );

  // ── Fetch functions ──
  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/withdrawals');
      if (res.ok) {
        const data = await res.json();
        const all: Withdrawal[] = data.withdrawals || [];
        setPendingVerification(all.filter(w => w.status === 'PENDING_VERIFICATION'));
        setPending(all.filter(w => w.status === 'PENDING'));
        setProcessed(all.filter(w => w.status === 'APPROVED' || w.status === 'REJECTED'));
      }
    } catch (e) {}
    finally { setLoadingWithdrawals(false); }
  }, []);

  const fetchLoans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/loans');
      if (res.ok) { const data = await res.json(); setLoans(data.loans || []); }
    } catch (e) {}
    finally { setLoadingLoans(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {}
    finally { setLoadingUsers(false); }
  }, []);

  const fetchTickets = useCallback(async (filter = statusFilter, silent = false) => {
    if (!silent) setLoadingTickets(true);
    setTicketError('');
    try {
      const res  = await fetch(`/api/admin/support/tickets?status=${filter}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setTicketError(data.error || 'Failed to load tickets.'); return; }
      setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
    } catch { setTicketError('Network error.'); }
    finally { if (!silent) setLoadingTickets(false); }
  }, [statusFilter]);

  const fetchTicketDetail = useCallback(async (id: string, silent = false) => {
    if (!silent) setDetailLoading(true);
    setDetailError('');
    try {
      const res  = await fetch(`/api/admin/support/tickets/${id}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setDetailError(data.error || 'Failed to load ticket.'); return; }
      const ticket = data?.ticket as Ticket | undefined;
      if (!ticket) { setDetailError('Ticket not found.'); return; }
      setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
    } catch { setDetailError('Network error.'); }
    finally { if (!silent) setDetailLoading(false); }
  }, []);

  // ── Effects ──
  useEffect(() => {
    fetchWithdrawals();
    fetchUsers();
    fetchLoans();
  }, []);

  useEffect(() => { fetchTickets(statusFilter); }, [statusFilter]);

  // Poll ticket list every 10s
  useEffect(() => {
    const i = setInterval(() => fetchTickets(statusFilter, true), 10_000);
    return () => clearInterval(i);
  }, [fetchTickets, statusFilter]);

  // Poll selected ticket every 5s
  useEffect(() => {
    if (!selectedId) return;
    const i = setInterval(() => fetchTicketDetail(selectedId, true), 5_000);
    return () => clearInterval(i);
  }, [fetchTicketDetail, selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  // ── Support handlers ──
  const handleSelect = (id: string) => { setSelectedId(id); fetchTicketDetail(id); };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.target.value);
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 120)}px`; }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); }
  };

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim() || replying) return;
    setReplying(true); setDetailError('');
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setDetailError(data.error || 'Failed to send reply.'); return; }
      setReply('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets(statusFilter);
    } catch { setDetailError('Network error.'); }
    finally { setReplying(false); }
  };

  const handleUpdateStatus = async (nextStatus: 'OPEN' | 'CLOSED') => {
    if (!selectedTicket) return;
    setDetailError('');
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setDetailError(data.error || 'Failed to update status.'); return; }
      await fetchTicketDetail(selectedTicket.id);
      await fetchTickets(statusFilter);
    } catch { setDetailError('Network error.'); }
  };

  // ── Derived ──
  const unreadCount           = countUnreadMessages(tickets);
  const pendingLoans          = loans.filter(l => l.status === 'PENDING');
  const actionableWithdrawals = pendingVerification.length + pending.length;
  const filteredUsers         = users.filter((u: any) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = groupByDate(selectedTicket?.messages ?? []);

  const tabs = [
    { id: 'chat',        label: 'Support',     icon: MessageSquare, badge: unreadCount,           activeBg: 'bg-[#1e7a52]',  badgeBg: 'bg-[#1e7a52]'  },
    { id: 'users',       label: 'Users',       icon: Users,         badge: users.length,          activeBg: 'bg-violet-500', badgeBg: 'bg-violet-500' },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpToLine, badge: actionableWithdrawals, activeBg: 'bg-orange-400', badgeBg: 'bg-orange-400' },
    { id: 'loans',       label: 'Loans',       icon: Landmark,      badge: pendingLoans.length,   activeBg: 'bg-[#155c3a]',  badgeBg: 'bg-[#155c3a]'  },
  ];

  // ── Withdrawal card ──
  const WithdrawalCard = ({ tx }: { tx: Withdrawal }) => (
    <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13.5px] font-semibold text-[#0f2419]">{tx.user?.name || 'Unknown'}</p>
            {tx.status === 'PENDING_VERIFICATION' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                <ShieldAlert size={10} /> No Code
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#6a8c7a] mt-0.5">{tx.user?.email}</p>
          {tx.note && (
            <p className="text-[12px] text-[#6a8c7a] italic mt-1.5 bg-[#e4f2ec] px-3 py-1.5 rounded-lg border border-[#c8dfd5]">
              "{tx.note}"
            </p>
          )}
          <p className="text-[11px] text-[#6a8c7a] mt-1.5">
            {new Date(tx.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-[#0f2419]">
            {tx.currency === 'USD' ? '$' : '€'}{(tx.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-[#6a8c7a] mt-0.5">{tx.currency}</p>
        </div>
      </div>
      <div className="border-t border-[#d8ede6] pt-4">
        <WithdrawalActionsInline requestId={tx.id} onSuccess={fetchWithdrawals} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f7f4] p-4 lg:p-8">
      <div className="max-w-lg mx-auto lg:max-w-4xl space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#1e7a52]"
               style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>NexaBank</p>
            <h1 className="text-[22px] font-semibold text-[#0f2419] tracking-tight mt-0.5"
                style={{ fontFamily: "'Playfair Display', serif" }}>Admin Panel</h1>
          </div>
          {unreadCount > 0 && (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#e4f2ec] border border-[#c8dfd5] shadow-sm flex items-center justify-center">
                <Bell size={18} className="text-[#2d5042]" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1e7a52] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* ── Tab nav ── */}
        <div className="grid grid-cols-4 gap-2">
          {tabs.map(({ id, label, icon: Icon, badge, activeBg, badgeBg }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id as any)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all active:scale-[0.97]',
                  isActive
                    ? `${activeBg} border-transparent text-white shadow-md`
                    : 'bg-[#f2f9f6] border-[#c8dfd5] text-[#6a8c7a] hover:border-[#4daa80] shadow-sm'
                )}
              >
                {badge > 0 && (
                  <span className={cn(
                    'absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center',
                    isActive ? 'bg-white/25 text-white' : `${badgeBg} text-white`
                  )}>
                    {badge}
                  </span>
                )}
                <Icon size={20} strokeWidth={1.75} />
                <span className="text-[11px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>

        {/* ══ Support Tab ══ */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Left — ticket list */}
            <div className="lg:col-span-1 bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 520 }}>

              {/* Filter toggle */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#d8ede6]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6a8c7a]" />
                  <p className="text-[13px] font-bold text-[#0f2419]">Conversations</p>
                </div>
                <div className="flex items-center gap-1 bg-[#e4f2ec] border border-[#c8dfd5] rounded-xl p-0.5">
                  {(['OPEN', 'CLOSED'] as const).map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setSelectedId(null); }}
                      className={cn(
                        'px-2.5 py-1 rounded-[9px] text-[10px] font-bold transition-all',
                        statusFilter === s
                          ? s === 'OPEN' ? 'bg-[#1e7a52] text-white' : 'bg-[#d8ede6] text-[#2d5042]'
                          : 'text-[#6a8c7a] hover:text-[#2d5042]'
                      )}>
                      {s === 'OPEN' ? 'Open' : 'Closed'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {ticketError && <div className="px-5 py-3 text-[12px] text-rose-500">{ticketError}</div>}
                {loadingTickets ? (
                  <div className="flex items-center justify-center h-full gap-2 text-[#6a8c7a] text-sm">
                    <Loader2 className="animate-spin" size={18} /> Loading...
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-5">
                    <MessageCircle className="w-7 h-7 text-[#c8dfd5] mb-3" />
                    <p className="text-[13px] font-semibold text-[#6a8c7a]">No {statusFilter.toLowerCase()} tickets</p>
                  </div>
                ) : tickets.map(ticket => {
                  const isActive = selectedId === ticket.id;
                  const lastMsg  = ticket.messages?.[ticket.messages.length - 1];
                  return (
                    <button key={ticket.id} onClick={() => handleSelect(ticket.id)}
                      className={cn(
                        'w-full text-left px-5 py-4 border-b border-[#e4f2ec] transition-colors',
                        isActive ? 'bg-[#e4f2ec]' : 'hover:bg-[#eaf5f0]'
                      )}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1e7a52] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5">
                          {getInitials(ticket.user?.name, ticket.user?.email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-semibold text-[#0f2419] truncate">
                              {ticket.user?.name || ticket.user?.email || 'Unknown'}
                            </p>
                            <span className="text-[10px] text-[#6a8c7a] flex-shrink-0">{formatTime(ticket.updatedAt)}</span>
                          </div>
                          <p className="text-[12px] text-[#6a8c7a] truncate mt-0.5">{ticket.subject}</p>
                          {lastMsg && (
                            <p className="text-[11px] text-[#a8c8b8] truncate mt-0.5">
                              {lastMsg.sender === 'ADMIN' ? 'You: ' : ''}{lastMsg.body}
                            </p>
                          )}
                        </div>
                        {ticket.status === 'OPEN'
                          ? <Circle className="w-2 h-2 fill-[#1e7a52] text-[#1e7a52] flex-shrink-0 mt-1.5" />
                          : <Circle className="w-2 h-2 fill-[#c8dfd5] text-[#c8dfd5] flex-shrink-0 mt-1.5" />
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right — chat thread */}
            <div className="lg:col-span-2 bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 520 }}>
              {!selectedTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#e4f2ec] border border-[#c8dfd5] flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-[#a8c8b8]" />
                  </div>
                  <p className="text-[14px] font-semibold text-[#6a8c7a]">Select a conversation</p>
                  <p className="text-[12px] text-[#a8c8b8] mt-1">Choose a ticket on the left to view messages.</p>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#d8ede6]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1e7a52] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                        {getInitials(selectedTicket.user?.name, selectedTicket.user?.email)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0f2419]">
                          {selectedTicket.user?.name || selectedTicket.user?.email || 'Unknown'}
                        </p>
                        <p className="text-[11px] text-[#6a8c7a]">{selectedTicket.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border',
                        selectedTicket.status === 'OPEN'
                          ? 'bg-[#edf7f5] text-[#1e7a52] border-[#a8dbd4]'
                          : 'bg-[#e4f2ec] text-[#6a8c7a] border-[#c8dfd5]'
                      )}>
                        {selectedTicket.status === 'OPEN' ? '● Open' : 'Closed'}
                      </span>
                      {selectedTicket.status === 'OPEN' ? (
                        <button onClick={() => handleUpdateStatus('CLOSED')}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6a8c7a] border border-[#c8dfd5] px-3 py-1.5 rounded-full hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Close
                        </button>
                      ) : (
                        <button onClick={() => handleUpdateStatus('OPEN')}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6a8c7a] border border-[#c8dfd5] px-3 py-1.5 rounded-full hover:border-[#1e7a52]/30 hover:text-[#1e7a52] hover:bg-[#edf7f5] transition-all">
                          <RefreshCw className="w-3.5 h-3.5" /> Reopen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {detailLoading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-[#a8c8b8]" />
                      </div>
                    )}
                    {detailError && <div className="text-[12px] text-rose-500 text-center">{detailError}</div>}
                    {!detailLoading && (selectedTicket.messages ?? []).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-[13px] text-[#6a8c7a]">No messages yet.</p>
                      </div>
                    )}

                    {grouped.map(({ date, messages: dayMsgs }) => (
                      <div key={date}>
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-[#d8ede6]" />
                          <span className="text-[11px] text-[#6a8c7a] font-medium">
                            {formatDateDivider(dayMsgs[0].createdAt)}
                          </span>
                          <div className="flex-1 h-px bg-[#d8ede6]" />
                        </div>
                        <div className="space-y-3">
                          {dayMsgs.map(msg => {
                            const isAdmin = msg.sender === 'ADMIN';
                            return (
                              <div key={msg.id} className={cn('flex', isAdmin ? 'justify-end' : 'justify-start')}>
                                {!isAdmin && (
                                  <div className="w-7 h-7 rounded-full bg-[#1e7a52] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-0.5 self-end">
                                    {getInitials(selectedTicket.user?.name, selectedTicket.user?.email)}
                                  </div>
                                )}
                                <div className={cn('max-w-[72%] flex flex-col', isAdmin ? 'items-end' : 'items-start')}>
                                  <div className={cn(
                                    'px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed',
                                    isAdmin
                                      ? 'bg-[#0f2419] text-white rounded-br-sm'
                                      : 'bg-[#e4f2ec] text-[#0f2419] border border-[#c8dfd5] rounded-bl-sm'
                                  )}>
                                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                                  </div>
                                  <span className="text-[10px] text-[#6a8c7a] mt-1 px-1">
                                    {isAdmin ? 'You · ' : ''}{formatTime(msg.createdAt)}
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
                  <div className="border-t border-[#d8ede6] px-4 py-3">
                    <div className="flex items-end gap-3">
                      <textarea
                        ref={textareaRef}
                        value={reply}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Reply to this user… (Enter to send)"
                        className="flex-1 resize-none bg-[#e4f2ec] border border-[#c8dfd5] rounded-[13px] px-4 py-2.5 text-[13px] text-[#0f2419] placeholder-[#6a8c7a] focus:outline-none focus:border-[#1e7a52] focus:bg-white transition-all"
                        style={{ minHeight: '42px', maxHeight: '120px' }}
                      />
                      <button onClick={handleReply} disabled={!reply.trim() || replying}
                        className="w-10 h-10 rounded-[13px] bg-[#0f2419] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#1e7a52] transition-all active:scale-95 disabled:opacity-30 mb-0.5">
                        {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#6a8c7a] mt-2 px-1">Shift+Enter for new line</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ Users Tab ══ */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[#6a8c7a] text-sm">{users.length} total users</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a8c7a]" size={15} />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-xl py-2 pl-9 pr-4 text-[#0f2419] text-sm focus:outline-none focus:border-[#1e7a52] transition-colors w-48 shadow-sm"
                />
              </div>
            </div>
            <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl shadow-sm overflow-hidden">
              {loadingUsers ? (
                <div className="flex justify-center items-center gap-2 p-10 text-[#6a8c7a]">
                  <Loader2 className="animate-spin" size={18} /> Loading...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-[#6a8c7a] text-sm">No users found</div>
              ) : (
                <div className="divide-y divide-[#e4f2ec]">
                  {filteredUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between px-5 py-4 hover:bg-[#e4f2ec] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1e7a52] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#0f2419] font-semibold text-sm truncate">{user.name || 'Unnamed'}</p>
                          <p className="text-[#6a8c7a] text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                        <p className="text-[#0f2419] text-sm font-bold tabular-nums">
                          ${(user.portfolioBalance || 0).toLocaleString()}
                        </p>
                        <Link href={`/admin/users/${user.id}`}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#e4f2ec] text-[#1e7a52] hover:bg-[#1e7a52] hover:text-white rounded-lg transition-colors text-xs font-semibold border border-[#c8dfd5]">
                          <Edit size={12} /> Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ Withdrawals Tab ══ */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-5">

            {/* Pending Verification */}
            {pendingVerification.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={15} className="text-rose-500" />
                  <span className="text-[13px] font-semibold text-[#2d5042] uppercase tracking-wider">Awaiting Verification</span>
                  <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{pendingVerification.length}</span>
                </div>
                {pendingVerification.map(tx => <WithdrawalCard key={tx.id} tx={tx} />)}
              </div>
            )}

            {/* Pending */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-500" />
                <span className="text-[13px] font-semibold text-[#2d5042] uppercase tracking-wider">Pending</span>
                {pending.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
                )}
              </div>
              {loadingWithdrawals ? (
                <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl flex justify-center items-center gap-2 py-12 text-[#6a8c7a]">
                  <Loader2 className="animate-spin" size={18} /> Loading...
                </div>
              ) : pending.length === 0 ? (
                <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl flex flex-col items-center justify-center py-12 text-[#6a8c7a] gap-2">
                  <InboxIcon size={28} className="opacity-30" />
                  <p className="text-sm">No pending withdrawals</p>
                </div>
              ) : pending.map(tx => <WithdrawalCard key={tx.id} tx={tx} />)}
            </div>

            {/* Code Generator */}
            <WithdrawalCodeSection users={users} />

            {/* Recently Processed */}
            {processed.length > 0 && (
              <div className="space-y-3">
                <span className="text-[13px] font-semibold text-[#2d5042] uppercase tracking-wider">Recently Processed</span>
                <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl divide-y divide-[#e4f2ec] overflow-hidden">
                  {processed.slice(0, 20).map(r => {
                    const isApproved = r.status === 'APPROVED';
                    const Icon = isApproved ? CheckCircle : XCircle;
                    return (
                      <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', isApproved ? 'bg-[#edf7f5]' : 'bg-rose-50')}>
                          <Icon className={cn('w-4 h-4', isApproved ? 'text-[#1e7a52]' : 'text-rose-500')} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#0f2419] truncate">{r.user?.name}</p>
                          <p className="text-[11px] text-[#6a8c7a] mt-0.5">
                            {new Date(r.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {r.adminNote && <p className="text-[11px] text-[#6a8c7a] italic mt-0.5">"{r.adminNote}"</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[13px] font-semibold text-[#0f2419]">
                            {r.currency === 'USD' ? '$' : '€'}{(r.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block', isApproved ? 'bg-[#edf7f5] text-[#1e7a52]' : 'bg-rose-50 text-rose-600')}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ Loans Tab ══ */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Landmark size={16} className="text-[#1e7a52]" />
              <span className="text-[#0f2419] font-semibold text-sm">Loan Applications</span>
              {pendingLoans.length > 0 && (
                <span className="bg-[#1e7a52] text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingLoans.length} pending</span>
              )}
            </div>

            {loadingLoans ? (
              <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl flex justify-center items-center gap-2 py-16 text-[#6a8c7a]">
                <Loader2 className="animate-spin" size={18} /> Loading...
              </div>
            ) : loans.length === 0 ? (
              <div className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl flex flex-col items-center justify-center py-16 text-[#6a8c7a] gap-2">
                <Landmark size={32} className="opacity-30" />
                <p className="text-sm">No loan applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loans.map(loan => (
                  <div key={loan.id} className="bg-[#f2f9f6] border border-[#c8dfd5] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1e7a52] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {(loan.user?.name || loan.user?.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-[#0f2419] truncate">{loan.user?.name || 'Unknown'}</p>
                          <p className="text-[12px] text-[#6a8c7a] truncate">{loan.user?.email}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e4f2ec] text-[#2d5042]">{loan.purpose}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e4f2ec] text-[#2d5042]">{loan.termMonths}mo</span>
                            <span className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              loan.status === 'PENDING'  && 'bg-amber-50 text-amber-600 border border-amber-100',
                              loan.status === 'APPROVED' && 'bg-[#edf7f5] text-[#1e7a52] border border-[#a8dbd4]',
                              loan.status === 'REJECTED' && 'bg-rose-50 text-rose-500 border border-rose-100',
                            )}>
                              {loan.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-[#0f2419]">
                          ${(loan.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-[#6a8c7a] mt-0.5">
                          {new Date(loan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {loan.note && (
                      <p className="text-[12px] text-[#6a8c7a] italic mb-3 bg-[#e4f2ec] px-3 py-1.5 rounded-lg border border-[#c8dfd5]">
                        "{loan.note}"
                      </p>
                    )}
                    {loan.status === 'PENDING' && (
                      <div className="border-t border-[#d8ede6] pt-4">
                        <LoanActionsInline loanId={loan.id} onSuccess={fetchLoans} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
