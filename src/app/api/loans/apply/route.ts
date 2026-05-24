import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true },
  });

  if (user?.kycStatus !== "VERIFIED")
    return NextResponse.json({ error: "KYC verification required" }, { status: 403 });

  const { amount, purpose, termMonths } = await req.json();

  if (!amount || amount < 10000)
    return NextResponse.json({ error: "Minimum loan amount is $100" }, { status: 400 });
  if (!purpose || !termMonths)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const account = await prisma.account.findUnique({
    where: { userId: session.user.id },
  });
  if (!account)
    return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const loan = await prisma.loan.create({
    data: {
      userId:    session.user.id,
      accountId: account.id,
      amount,
      purpose,
      termMonths,
      status:    "PENDING",
    },
  });

  return NextResponse.json({ id: loan.id }, { status: 201 });
}
