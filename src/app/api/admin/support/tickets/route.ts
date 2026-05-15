import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/support/tickets?status=OPEN|CLOSED
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") === "CLOSED" ? "CLOSED" : "OPEN";

  const tickets = await prisma.supportTicket.findMany({
    where:   { status },
    orderBy: { updatedAt: "desc" },
    include: {
      user:     { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({
    tickets: tickets.map((t) => ({
      id:        t.id,
      subject:   t.subject,
      status:    t.status,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      user:      t.user,
      messages:  t.messages.map((m) => ({
        id:        m.id,
        sender:    m.sender,
        body:      m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    })),
  });
}
