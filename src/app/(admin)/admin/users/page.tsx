import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where:   { role: "USER" },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No users yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>

                {/* Balance */}
                <div className="text-right flex-shrink-0">
                  {user.account ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900 money">
                        {formatMoney(user.account.balance, user.account.currency)}
                      </p>
                      <p className="text-xs text-gray-400">{user.account.currency}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">No account</p>
                  )}
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xs text-gray-400">Joined {formatDate(user.createdAt)}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
