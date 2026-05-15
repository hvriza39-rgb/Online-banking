import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/support/thread/messages
// Sends a message. Creates the ticket if this is the first message.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { body, ticketId } = await req.json().catch(() => ({}));
  if (!body?.trim()) return NextResponse.json({ error: "Message body is required." }, { status: 400 });

  let ticket;

  if (ticketId) {
    // Existing thread — verify ownership
    ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }
    // Reopen if closed
    if (ticket.status === "CLOSED") {
      ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data:  { status: "OPEN", updatedAt: new Date() },
      });
    }
  } else {
    // First message — create the ticket
    ticket = await prisma.supportTicket.create({
      data: {
        userId:  session.user.id,
        subject: body.slice(0, 80),   // first message becomes the subject
        status:  "OPEN",
      },
    });
  }

  await prisma.supportMessage.create({
    data: {
      ticketId: ticket.id,
      sender:   "USER",
      body:     body.trim(),
    },
  });

  // Bump updatedAt on the ticket
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data:  { updatedAt: new Date() },
  });

  return NextResponse.json({ ticketId: ticket.id, status: ticket.status });
}
