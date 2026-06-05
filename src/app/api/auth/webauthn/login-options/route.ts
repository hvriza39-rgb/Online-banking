import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();

  const rpID = new URL(process.env.NEXTAUTH_URL!).hostname;

  // If email provided, scope to that user's credentials (optional hint)
  // If no email, use empty allowCredentials = discoverable mode
  let allowCredentials: { id: Uint8Array; type: "public-key" }[] = [];
  let userId: string | null = null;

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { webAuthnCredentials: true },
    });

    if (user && user.webAuthnCredentials.length > 0) {
      allowCredentials = user.webAuthnCredentials.map((c) => ({
        id: new TextEncoder().encode(c.credentialId),
        type: "public-key" as const,
      }));
      userId = user.id;
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials, // empty array = discoverable (no email needed)
  });

  // Store challenge — if we know the user, store on their record
  // If discoverable, store in a temp table or cookie (we'll resolve user in verify)
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { webAuthnChallenge: options.challenge },
    });
  } else {
    // Store challenge temporarily so login-verify can find it
    await prisma.webAuthnChallenge.upsert({
      where: { id: "pending" },
      update: { challenge: options.challenge, createdAt: new Date() },
      create: { id: "pending", challenge: options.challenge, createdAt: new Date() },
    });
  }

  return NextResponse.json(options);
}
