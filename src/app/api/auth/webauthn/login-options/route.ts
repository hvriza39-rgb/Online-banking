import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();

  const rpID = new URL(process.env.NEXTAUTH_URL!).hostname;

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
    allowCredentials,
  });

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { webAuthnChallenge: options.challenge },
    });
  }

  // Always store challenge in cookie (covers discoverable flow)
  const response = NextResponse.json(options);
  response.cookies.set("webauthn_challenge", options.challenge, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 5,
  });
  return response;
}
