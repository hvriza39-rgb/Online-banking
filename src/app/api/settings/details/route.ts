// app/api/settings/details/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name:  z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { kycStatus: true },
  });

  if (user?.kycStatus === "VERIFIED") {
    return NextResponse.json({ error: "Details cannot be changed after KYC verification." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, email } = parsed.data;

  // Check email not taken by another user
  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { name, email },
  });

  return NextResponse.json({ success: true });
}
