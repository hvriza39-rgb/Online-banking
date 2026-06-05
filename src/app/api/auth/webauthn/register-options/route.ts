import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRegistrationOptions } from "@simplewebauthn/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { webAuthnCredentials: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const options = await generateRegistrationOptions({
    rpName: "NexaBank",
    rpID: new URL(process.env.NEXTAUTH_URL!).hostname,
    userID: user.id, 
    userName: user.email,
    userDisplayName: user.name ?? user.email,
    attestationType: "none",
    excludeCredentials: user.webAuthnCredentials.map((c) => ({
      id: c.credentialId,
      type: "public-key",
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required", // forces biometric
    },
  });

  // Store challenge in DB temporarily
  await prisma.user.update({
    where: { id: user.id },
    data: { webAuthnChallenge: options.challenge },
  });

  return NextResponse.json(options);
    }
