'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Users, MessageSquare, Send, X, ChevronRight,
  CheckCircle, XCircle, ArrowUpToLine, Search,
  Edit, Loader2, Bell, Activity
} from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  user: { name?: string; email?: string };
  messages: { id: string; sender: string; body: string; createdAt: string }[];
}

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'users' | 'withdrawals'>('chat');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [processingTx, setProcessingTx] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboard();
    fetchTickets();
    fetchUsers();
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket]);

  const fetchDashboard = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.pendingWithdrawals || []);
      }
    } catch (e) {}
  };

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/support/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.tickets || data || [];
        setTickets(list);
        if (selectedTicket) {
          const updated = list.find((t: Ticket) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {}
    finally { setLoadingTickets(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {}
    finally { setLoadingUsers(false); }
  };

  const handleWithdrawal = async (txId: string, action: 'approve' | 'reject') => {
    setProcessingTx(txId);
    try {
      const res = await fetch('/api/admin/transactions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, action }),
      });
      if (res.ok) await fetchDashboard();
    } catch (e) {}
    finally { setProcessingTx(null); }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setSending(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: reply.trim() }),
      });
      if (res.ok) { setReply(''); await fetchTickets(); }
    } catch (e) {}
    finally { setSending(false); }
  };

  const openTickets = tickets.filter(t => t.status !== 'CLOSED');
  const unreadCount = countUnreadMessages(tickets);
  const filteredUsers = users.filter((u: any) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'chat',        label: 'Support',     icon: MessageSquare, badge: unreadCount,       activeBg: 'bg-blue-500',   badgeBg: 'bg-blue-500',   badgeText: 'text-blue-600'   },
    { id: 'users',       label: 'Users',       icon: Users,         badge: users.length,      activeBg: 'bg-violet-500', badgeBg: 'bg-violet-500', badgeText: 'text-violet-600' },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpToLine, badge: withdrawals.length, activeBg: 'bg-orange-400', badgeBg: 'bg-orange-400', badgeText: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-lg mx-auto lg:max-w-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Panel</h1>
            <p className="text-slate-400 text-xs mt-0.5">Welcome back</p>
          </div>
          {unreadCount > 0 && (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <Bell size={18} className="text-slate-600" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Tab nav cards */}
        <div className="grid grid-cols-3 gap-3">
          {tabs.map(({ id, label, icon: Icon, badge, activeBg, badgeBg, badgeText }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border transition-all active:scale-[0.97]',
                  isActive
                    ? `${activeBg} border-transparent text-white shadow-md`
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 shadow-sm hover:shadow-md'
                )}
              >
                {badge > 0 && (
                  <span className={cn(
                    'absolute top-2.5 right-2.5 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
                    isActive ? 'bg-white/25 text-white' : `${badgeBg} text-white`
                  )}>
                    {badge}
                  </span>
                )}
                <Icon size={22} strokeWidth={1.75} />
                <span className="text-[13px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Support Tab ── */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: 560 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-blue-500" />
                <span className="text-slate-800 font-semibold text-sm">Live Support</span>
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              {selectedTicket && (
                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>

            {!selectedTicket ? (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {loadingTickets ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
                    <Loader2 className="animate-spin" size={18} /> Loading...
                  </div>
                ) : openTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <MessageSquare size={32} className="opacity-30" />
                    <p className="text-sm">No open support tickets</p>
                  </div>
                ) : openTickets.map(ticket => {
                  const msgs = ticket.messages ?? [];
                  const lastAdminIdx = msgs.map(m => m.sender).lastIndexOf('ADMIN');
                  const ticketUnread = msgs.filter((m, i) => m.sender === 'USER' && i > lastAdminIdx).length;
                  const last = msgs[msgs.length - 1];
                  const initial = (ticket.user?.name || ticket.user?.email || '?').charAt(0).toUpperCase();
                  return (
                    <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                      className="w-full px-5 py-4 hover:bg-slate-50 transition-colors text-left flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-slate-800 font-semibold text-sm truncate">
                            {ticket.user?.name || ticket.user?.email || 'Unknown'}
                          </span>
                          <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                            ticket.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          )}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs truncate">{ticket.subject}</p>
                        {last && (
                          <p className="text-slate-300 text-xs truncate mt-0.5">
                            {last.sender === 'ADMIN' ? 'You: ' : ''}{last.body}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-slate-400 text-xs">
                          {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {ticketUnread > 0
                          ? <span className="w-5 h-5 bg-blue-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{ticketUnread}</span>
                          : <ChevronRight size={14} className="text-slate-300" />
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                    {(selectedTicket.user?.name || selectedTicket.user?.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-slate-800 text-sm font-semibold">{selectedTicket.user?.name || selectedTicket.user?.email}</p>
                    <p className="text-slate-400 text-xs">{selectedTicket.subject}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {selectedTicket.messages?.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                      <div className={cn(
                        'max-w-[80%] px-4 py-2 rounded-2xl text-sm',
                        msg.sender === 'ADMIN'
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                      )}>
                        <p>{msg.body}</p>
                        <p className={cn('text-xs mt-1', msg.sender === 'ADMIN' ? 'text-blue-200' : 'text-slate-400')}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder="Type a reply..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-sm placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
                  />
                  <button onClick={sendReply} disabled={sending || !reply.trim()}
                    className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-slate-400 text-sm">{users.length} total users</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-slate-800 text-sm focus:outline-none focus:border-blue-400 transition-colors w-48 shadow-sm"
                />
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              {loadingUsers ? (
                <div className="flex justify-center items-center gap-2 p-10 text-slate-400">
                  <Loader2 className="animate-spin" size={18} /> Loading...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">No users found</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-800 font-semibold text-sm truncate">{user.name || 'Unnamed'}</p>
                          <p className="text-slate-400 text-xs truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                        <p className="text-slate-800 text-sm font-bold tabular-nums">${(user.portfolioBalance || 0).toLocaleString()}</p>
                        <Link href={`/admin/users/${user.id}`}
                          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors text-xs font-semibold">
                          <Edit size={12} />
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Withdrawals Tab ── */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: 560 }}>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <ArrowUpToLine size={16} className="text-orange-400" />
              <span className="text-slate-800 font-semibold text-sm">Withdrawal Requests</span>
              {withdrawals.length > 0 && (
                <span className="bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">{withdrawals.length}</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <CheckCircle size={32} className="opacity-30" />
                  <p className="text-sm">No pending withdrawals</p>
                </div>
              ) : withdrawals.map(tx => (
                <div key={tx.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-slate-800 font-semibold text-sm">{tx.user?.name || 'Unknown'}</span>
                      {tx.user?.email && (
                        <p className="text-slate-400 text-[10px] font-mono mt-0.5">{tx.user.email}</p>
                      )}
                    </div>
                    <span className="text-slate-900 font-bold tabular-nums">${tx.amount?.toLocaleString()}</span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">
                    {tx.network} • {tx.address ? `${tx.address.substring(0, 6)}...${tx.address.slice(-4)}` : 'N/A'}
                  </span>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleWithdrawal(tx.id, 'approve')}
                      disabled={processingTx === tx.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-40 text-sm font-semibold border border-emerald-100">
                      {processingTx === tx.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleWithdrawal(tx.id, 'reject')}
                      disabled={processingTx === tx.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-40 text-sm font-semibold border border-rose-100">
                      {processingTx === tx.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
