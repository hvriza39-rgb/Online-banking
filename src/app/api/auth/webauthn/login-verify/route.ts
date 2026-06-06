import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  console.log("[login-verify] called");
  const body = await req.json();
  console.log("[login-verify] body keys:", Object.keys(body));
  console.log("[login-verify] has email:", !!body.email);
  console.log("[login-verify] has credential:", !!body.credential);
  console.log("[login-verify] userHandle:", body.credential?.response?.userHandle);

  const { email, credential } = body;

  const rpID = new URL(process.env.NEXTAUTH_URL!).hostname;
  const origin = process.env.NEXTAUTH_URL!;

  let user;

  if (email) {
    user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { webAuthnCredentials: true },
    });
  } else {
    const userHandle = credential.response.userHandle;
    console.log("[login-verify] userHandle raw:", userHandle);
    if (!userHandle) {
      console.log("[login-verify] no userHandle found");
      return NextResponse.json({ error: "No user identity in credential" }, { status: 400 });
    }

    const userId = Buffer.from(userHandle, "base64url").toString("utf8");
    console.log("[login-verify] decoded userId:", userId);
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { webAuthnCredentials: true },
    });
  }

  if (!user) {
    console.log("[login-verify] user not found");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  console.log("[login-verify] user found:", user.id);

  let expectedChallenge = user.webAuthnChallenge;

  if (!expectedChallenge) {
    const cookieChallenge = req.cookies.get("webauthn_challenge")?.value;
    console.log("[login-verify] cookie challenge:", !!cookieChallenge);
    if (!cookieChallenge) {
      return NextResponse.json({ error: "No challenge found" }, { status: 400 });
    }
    expectedChallenge = cookieChallenge;
  }

  const dbCredential = user.webAuthnCredentials.find(
    (c) => c.credentialId === credential.id
  );

  console.log("[login-verify] credential match:", !!dbCredential);

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

    console.log("[login-verify] verified:", verification.verified);

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
    console.error("[login-verify] error:", err);
    return NextResponse.json({ error: "Auth error" }, { status: 500 });
  }
      }
