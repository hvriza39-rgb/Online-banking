import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Minimum balance required to apply (in cents) — $10.00
const MIN_BALANCE = 1000;

function randomDigits(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

function generateCardNumber() {
  // 16-digit number in four groups
  return `${randomDigits(4)}${randomDigits(4)}${randomDigits(4)}${randomDigits(4)}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const type = body.type as "DEBIT" | "CREDIT" | undefined;

  if (type !== "DEBIT" && type !== "CREDIT") {
    return NextResponse.json({ error: "Invalid card type." }, { status: 400 });
  }

  // Check existing card
  const existing = await prisma.card.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    return NextResponse.json({ error: "You already have a card." }, { status: 400 });
  }

  // Check balance
  const account = await prisma.account.findUnique({ where: { userId: session.user.id } });
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (account.balance < MIN_BALANCE) {
    return NextResponse.json({ error: "Insufficient balance to apply for a card." }, { status: 400 });
  }

  // Generate card details
  const cardNumber  = generateCardNumber();
  const last4       = cardNumber.slice(-4);
  const cvv         = randomDigits(3);
  const now         = new Date();
  const expiryMonth = now.getMonth() + 1;
  const expiryYear  = now.getFullYear() + 3;

  const card = await prisma.card.create({
    data: {
      userId: session.user.id,
      type,
      cardNumber,
      last4,
      cvv,
      expiryMonth,
      expiryYear,
      status: "PENDING",
    },
  });

  return NextResponse.json({ card });
}
