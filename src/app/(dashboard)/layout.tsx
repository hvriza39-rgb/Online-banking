import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f2f8]">
      <Sidebar user={session.user} kycStatus={user?.kycStatus ?? "PENDING"} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
