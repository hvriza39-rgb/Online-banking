// PATCH /api/admin/kyc
// Approves or rejects a KYC submission.
// On approval: sets kycStatus to VERIFIED and stamps verifiedAt.
// On rejection: sets kycStatus to REJECTED and clears verifiedAt.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KycStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { kycStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.kycStatus !== KycStatus.PENDING) {
      return NextResponse.json({ error: "KYC is not pending" }, { status: 409 });
    }

    const newStatus    = action === "APPROVED" ? KycStatus.VERIFIED  : KycStatus.REJECTED;
    const verifiedAt   = action === "APPROVED" ? new Date()          : null;

    await prisma.$transaction([
      // Update user KYC status
      prisma.user.update({
        where: { id: userId },
        data:  { kycStatus: newStatus },
      }),

      // Stamp verifiedAt on the KYC record (null if rejected)
      prisma.kyc.update({
        where: { userId },
        data:  { verifiedAt },
      }),
    ]);

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/admin/kyc]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
