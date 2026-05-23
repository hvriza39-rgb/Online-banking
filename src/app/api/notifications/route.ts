// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — fetch all notifications for the current user
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take:    50,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH — mark all as read, or a specific one
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data:  { read: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data:  { read: true },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE — delete a single notification
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.notification.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
