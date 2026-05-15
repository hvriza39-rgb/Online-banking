import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withdrawalActionSchema } from "@/lib/validators";

// PATCH /api/withdrawals/[id] — admin approves or rejects
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body   = await req.json();
    const parsed = withdrawalActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { action, adminNote } = parsed.data;

    const request = await prisma.withdrawalRequest.findUnique({
      where: { id: params.id },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    if (action === "APPROVED") {
      const account = await prisma.account.findUnique({
        where: { userId: request.userId },
      });

      if (!account) {
        return NextResponse.json({ error: "User account not found" }, { status: 404 });
      }

      if (account.balance < request.amount) {
        return NextResponse.json(
          { error: "User has insufficient balance to fulfill this request" },
          { status: 400 }
        );
      }

      const newBalance = account.balance - request.amount;

      // Atomic: deduct balance + record transaction + update request
      await prisma.$transaction([
        prisma.account.update({
          where: { userId: request.userId },
          data:  { balance: newBalance },
        }),
        prisma.transaction.create({
          data: {
            accountId:    account.id,
            type:         "WITHDRAWAL",
            amount:       request.amount,
            balanceAfter: newBalance,
            note:         `Send approved${adminNote ? `: ${adminNote}` : ""}`,
          },
        }),
        prisma.withdrawalRequest.update({
          where: { id: params.id },
          data:  { status: "APPROVED", adminNote: adminNote ?? null },
        }),
      ]);
    } else {
      // Rejected — just update the request status
      await prisma.withdrawalRequest.update({
        where: { id: params.id },
        data:  { status: "REJECTED", adminNote: adminNote ?? null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/withdrawals/:id]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
