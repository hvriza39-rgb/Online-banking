import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/dashboard — returns pending withdrawals for the admin dashboard
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where:   { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });

    // Shape matches what AdminDashboard expects: tx.user.name, tx.amount, tx.network, tx.address
    const data = pendingWithdrawals.map((w) => ({
      id:      w.id,
      amount:  w.amount / 100,           // cents → major units
      network: w.sendType,               // e.g. "ACH", "WIRE"
      address: w.recipientAccountNumber, // account number shown truncated
      user:    { name: w.user.name, email: w.user.email },
      note:    w.note,
      createdAt: w.createdAt,
    }));

    return NextResponse.json({ pendingWithdrawals: data });
  } catch (error) {
    console.error("[GET /api/admin/dashboard]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
