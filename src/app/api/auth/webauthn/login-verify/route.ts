import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  const { email, credential } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { webAuthnCredentials: true },
  });

  if (!user?.webAuthnChallenge) {
    return NextResponse.json({ error: "No challenge" }, { status: 400 });
  }

  const dbCredential = user.webAuthnCredentials.find(
    (c) => c.credentialId === credential.id
  );

  if (!dbCredential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin: process.env.NEXTAUTH_URL!,
      expectedRPID: new URL(process.env.NEXTAUTH_URL!).hostname,
      requireUserVerification: true,
      authenticator: {
        credentialID: new TextEncoder().encode(dbCredential.credentialId),
        credentialPublicKey: new Uint8Array(dbCredential.publicKey),
        counter: dbCredential.counter,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    await prisma.webAuthnCredential.update({
      where: { id: dbCredential.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { webAuthnChallenge: null },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Auth error" }, { status: 500 });
  }
}
