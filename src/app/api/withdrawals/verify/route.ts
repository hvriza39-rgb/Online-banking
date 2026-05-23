import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/withdrawals/verify — user submits verification code for a held request
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, verificationCode } = body;

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }
    if (!verificationCode || typeof verificationCode !== "string" || verificationCode.trim() === "") {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    // Fetch the request — must belong to this user and be PENDING_VERIFICATION
    const request = await prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (request.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (request.status !== "PENDING_VERIFICATION") {
      return NextResponse.json({ error: "This request does not require verification" }, { status: 400 });
    }

    // Check code
    const record = await prisma.withdrawalCode.findUnique({
      where: { userId: session.user.id },
    });

    if (!record || record.code !== verificationCode.trim().toUpperCase()) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Upgrade to PENDING
    await prisma.withdrawalRequest.update({
      where: { id: requestId },
      data:  { status: "PENDING" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/withdrawals/verify]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
