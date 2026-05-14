import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where:   { role: "USER" },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl">
        <div className="mb-7 fade-up">
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="card fade-up delay-1">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-medium">No users yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[44px_1fr_160px_120px_32px] gap-4 px-6 py-3 border-b border-slate-100">
                {["", "User", "Balance", "Joined", ""].map((h, i) => (
                  <span key={i} className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</span>
                ))}
              </div>
              <div className="divide-y divide-slate-50">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="grid grid-cols-[44px_1fr_160px_120px_32px] gap-4 items-center px-6 py-4 hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm">
                      {getInitials(user.name)}
                    </div>

                    {/* Name / email */}
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-slate-800 truncate">{user.name}</p>
                      <p className="text-[12px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Balance */}
                    <div>
                      {user.account ? (
                        <>
                          <p className="text-[13.5px] font-semibold text-slate-800 money">
                            {formatMoney(user.account.balance, user.account.currency)}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{user.account.currency}</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400">No account</p>
                      )}
                    </div>

                    {/* Joined */}
                    <p className="text-[12px] text-slate-400">{formatDate(user.createdAt)}</p>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
