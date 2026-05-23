// app/api/admin/fund/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fundAccountSchema } from "@/lib/validators";
import { majorToCents, formatMoney } from "@/lib/utils";
import { TransactionType } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body   = await req.json();
    const parsed = fundAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { userId, amount, type, note } = parsed.data;
    const amountCents = majorToCents(amount);

    const account = await prisma.account.findUnique({ where: { userId } });
    if (!account) return NextResponse.json({ error: "User account not found" }, { status: 404 });

    if (type === "DEBIT" && account.balance < amountCents) {
      return NextResponse.json({ error: "Insufficient balance to debit this amount" }, { status: 400 });
    }

    const newBalance = type === "CREDIT"
      ? account.balance + amountCents
      : account.balance - amountCents;

    await prisma.$transaction([
      prisma.account.update({ where: { userId }, data: { balance: newBalance } }),
      prisma.transaction.create({
        data: {
          accountId:    account.id,
          type:         type as TransactionType,
          amount:       amountCents,
          balanceAfter: newBalance,
          note:         note ?? null,
        },
      }),
    ]);

    // ── Notification ──
    const formatted = formatMoney(amountCents, account.currency);
    if (type === "CREDIT") {
      await createNotification(
        userId,
        "ACCOUNT_CREDITED",
        "Funds Received",
        `${formatted} has been credited to your account.${note ? ` Note: ${note}` : ""}`,
      );
    } else {
      await createNotification(
        userId,
        "ACCOUNT_DEBITED",
        "Account Debited",
        `${formatted} has been debited from your account.${note ? ` Note: ${note}` : ""}`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/fund]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
