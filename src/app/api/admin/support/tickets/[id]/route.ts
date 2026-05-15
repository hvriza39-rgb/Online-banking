import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/support/tickets/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ticket = await prisma.supportTicket.findUnique({
    where:   { id: params.id },
    include: {
      user:     { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  return NextResponse.json({
    ticket: {
      id:        ticket.id,
      subject:   ticket.subject,
      status:    ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      user:      ticket.user,
      messages:  ticket.messages.map((m) => ({
        id:        m.id,
        sender:    m.sender,
        body:      m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

// PATCH /api/admin/support/tickets/[id]
// Body: { status: "OPEN" | "CLOSED" }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await req.json().catch(() => ({}));
  if (status !== "OPEN" && status !== "CLOSED") {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: params.id },
    data:  { status, updatedAt: new Date() },
  });

  return NextResponse.json({ ticketId: ticket.id, status: ticket.status });
}
