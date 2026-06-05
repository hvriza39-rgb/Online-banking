import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  const { email, credential } = await req.json();

  const rpID = new URL(process.env.NEXTAUTH_URL!).hostname;
  const origin = process.env.NEXTAUTH_URL!;

  let user;

  if (email) {
    // Email-scoped flow (user typed email then used biometric)
    user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { webAuthnCredentials: true },
    });
  } else {
    // Discoverable flow — userHandle in the credential response is the user ID
    const userHandle = credential.response.userHandle;
    if (!userHandle) {
      return NextResponse.json({ error: "No user identity in credential" }, { status: 400 });
    }

    // userHandle is base64url encoded — decode to get the user ID string
    const userId = Buffer.from(userHandle, "base64url").toString("utf8");
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { webAuthnCredentials: true },
    });
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get challenge — from user record or cookie (discoverable fallback)
  let expectedChallenge = user.webAuthnChallenge;

  if (!expectedChallenge) {
    const cookieChallenge = req.cookies.get("webauthn_challenge")?.value;
    if (!cookieChallenge) {
      return NextResponse.json({ error: "No challenge found" }, { status: 400 });
    }
    expectedChallenge = cookieChallenge;
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
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
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

    // Update counter
    await prisma.webAuthnCredential.update({
      where: { id: dbCredential.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });

    // Clear challenge
    await prisma.user.update({
      where: { id: user.id },
      data: { webAuthnChallenge: null },
    });

    // Clear challenge cookie if it was used
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    response.cookies.delete("webauthn_challenge");
    return response;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Auth error" }, { status: 500 });
  }
  } 
