import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users — returns all non-admin users with their account
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where:   { role: "USER" },
      include: { account: true },
      orderBy: { createdAt: "desc" },
    });

    // Shape matches what AdminDashboard expects
    const data = users.map((u) => ({
      id:               u.id,
      name:             u.name,
      email:            u.email,
      portfolioBalance: u.account ? u.account.balance / 100 : 0,
      currency:         u.account?.currency ?? "USD",
      createdAt:        u.createdAt,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
