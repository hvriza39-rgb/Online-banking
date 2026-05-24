import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const loans = await prisma.loan.findMany({
    orderBy: [
      { createdAt: "desc" },
    ],
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ loans });
}
