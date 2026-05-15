// POST /api/kyc
// Accepts KYC form data, generates account number, sets status to PENDING.
// Account is activated only after admin approval.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kycSchema } from "@/lib/kyc-validator";
import { generateAccountNumber } from "@/lib/utils";
import { KycStatus } from "@prisma/client";

// Retry loop in case of account number collision (extremely unlikely)
async function generateUniqueAccountNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const number = generateAccountNumber();
    const existing = await prisma.account.findUnique({
      where: { accountNumber: number },
    });
    if (!existing) return number;
  }
  throw new Error("Failed to generate unique account number after 10 attempts");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only regular users can submit KYC
    if (session.user.role === "ADMIN") {
      return NextResponse.json({ error: "Admins do not require KYC" }, { status: 403 });
    }

    const userId = session.user.id;

    // Check current KYC status
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { kycStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.kycStatus === KycStatus.VERIFIED) {
      return NextResponse.json({ error: "KYC already verified" }, { status: 409 });
    }

    // Prevent resubmission if already pending
    if (user.kycStatus === KycStatus.PENDING) {
      return NextResponse.json({ error: "KYC already submitted and pending review" }, { status: 409 });
    }

    // Validate input
    const body   = await req.json();
    const parsed = kycSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { fullName, dateOfBirth, address, idType, idNumber } = parsed.data;

    // Check for duplicate ID number
    const existingKyc = await prisma.kyc.findFirst({
      where: { idNumber, idType },
    });
    if (existingKyc && existingKyc.userId !== userId) {
      return NextResponse.json(
        { error: "This ID number is already associated with another account" },
        { status: 409 }
      );
    }

    const accountNumber = await generateUniqueAccountNumber();

    // Atomic: create/update KYC record + set status to PENDING + assign account number
    // verifiedAt is NOT set here — admin sets it on approval
    await prisma.$transaction([
      // Upsert KYC record
      prisma.kyc.upsert({
        where:  { userId },
        update: {
          fullName,
          dateOfBirth: new Date(dateOfBirth),
          address,
          idType,
          idNumber,
          verifiedAt: null,
        },
        create: {
          userId,
          fullName,
          dateOfBirth: new Date(dateOfBirth),
          address,
          idType,
          idNumber,
        },
      }),

      // Set user KYC status to PENDING (awaiting admin approval)
      prisma.user.update({
        where: { id: userId },
        data:  { kycStatus: KycStatus.PENDING },
      }),

      // Assign account number now — it will become visible after admin approves
      prisma.account.update({
        where: { userId },
        data:  { accountNumber },
      }),
    ]);

    return NextResponse.json({ success: true, accountNumber }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/kyc]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
