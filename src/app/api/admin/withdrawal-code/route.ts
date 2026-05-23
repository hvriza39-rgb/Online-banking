import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0,O,1,I)
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/admin/withdrawal-code — generate or regenerate a code for a user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const code = generateCode();

    const record = await prisma.withdrawalCode.upsert({
      where:  { userId },
      update: { code },
      create: { userId, code },
    });

    return NextResponse.json({ success: true, code: record.code, userId });
  } catch (error) {
    console.error("[POST /api/admin/withdrawal-code]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// GET /api/admin/withdrawal-code?userId=xxx — fetch existing code for a user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const record = await prisma.withdrawalCode.findUnique({ where: { userId } });

    return NextResponse.json({ code: record?.code ?? null });
  } catch (error) {
    console.error("[GET /api/admin/withdrawal-code]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
