import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { webAuthnCredentials: true },
  });

  if (!user || user.webAuthnCredentials.length === 0) {
    return NextResponse.json({ error: "No passkey found" }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID: new URL(process.env.NEXTAUTH_URL!).hostname,
    userVerification: "required",
    allowCredentials: user.webAuthnCredentials.map((c) => ({
  id: new TextEncoder().encode(c.credentialId),
  type: "public-key" as const,
})),

  await prisma.user.update({
    where: { id: user.id },
    data: { webAuthnChallenge: options.challenge },
  });

  return NextResponse.json(options);
    }
