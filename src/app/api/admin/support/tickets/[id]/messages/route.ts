import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/support/tickets/[id]/messages
// Body: { body: string }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { body } = await req.json().catch(() => ({}));
  if (!body?.trim()) return NextResponse.json({ error: "Message body is required." }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  await prisma.supportMessage.create({
    data: {
      ticketId: ticket.id,
      sender:   "ADMIN",
      body:     body.trim(),
    },
  });

  // Bump updatedAt and reopen if closed
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data:  { updatedAt: new Date(), status: "OPEN" },
  });

  return NextResponse.json({ ok: true });
}
