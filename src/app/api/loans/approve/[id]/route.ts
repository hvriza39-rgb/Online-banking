import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { note } = await req.json().catch(() => ({}));

  const loan = await prisma.loan.findUnique({
    where: { id: params.id },
    include: { account: true },
  });
  if (!loan)
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  if (loan.status !== "PENDING")
    return NextResponse.json({ error: "Loan already processed" }, { status: 400 });

  const newBalance = loan.account.balance + loan.amount;

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: params.id },
      data:  { status: "APPROVED", note: note ?? null },
    }),
    prisma.account.update({
      where: { id: loan.accountId },
      data:  { balance: newBalance },
    }),
    prisma.transaction.create({
      data: {
        accountId:    loan.accountId,
        type:         "CREDIT",
        amount:       loan.amount,
        balanceAfter: newBalance,
        note:         `Loan disbursed — ${loan.purpose}`,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
