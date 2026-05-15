import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withdrawalRequestSchema } from "@/lib/validators";
import { majorToCents } from "@/lib/utils";

// POST /api/withdrawals — user submits a send request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "ADMIN") {
      return NextResponse.json({ error: "Admins cannot submit send requests" }, { status: 403 });
    }

    const body   = await req.json();
    const parsed = withdrawalRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { amount, note } = parsed.data;
    const amountCents      = majorToCents(amount);

    const account = await prisma.account.findUnique({
      where: { userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (account.balance < amountCents) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Check for existing pending request
    const pending = await prisma.withdrawalRequest.findFirst({
      where: { userId: session.user.id, status: "PENDING" },
    });

    if (pending) {
      return NextResponse.json(
        { error: "You already have a pending send request" },
        { status: 400 }
      );
    }

    await prisma.withdrawalRequest.create({
      data: {
        userId:   session.user.id,
        amount:   amountCents,
        currency: account.currency,
        note:     note ?? null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/withdrawals]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// GET /api/withdrawals — user gets their own requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.withdrawalRequest.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error("[GET /api/withdrawals]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
