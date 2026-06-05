"use client";

import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import { signIn } from "next-auth/react";

export function useWebAuthn() {
  async function registerBiometric(deviceName?: string) {
    // Get options from server
    const optRes = await fetch("/api/auth/webauthn/register-options");
    if (!optRes.ok) throw new Error("Failed to get registration options");
    const options = await optRes.json();

    // Trigger biometric prompt
    const credential = await startRegistration({ optionsJSON: options });

    // Verify with server
    const verRes = await fetch("/api/auth/webauthn/register-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, deviceName }),
    });

    if (!verRes.ok) throw new Error("Registration failed");
    return true;
  }

  async function loginWithBiometric(email: string) {
    // Get options
    const optRes = await fetch("/api/auth/webauthn/login-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!optRes.ok) throw new Error("No passkey found for this account");
    const options = await optRes.json();

    // Trigger biometric prompt
    const credential = await startAuthentication({ optionsJSON: options });

    // Verify
    const verRes = await fetch("/api/auth/webauthn/login-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, credential }),
    });

    if (!verRes.ok) throw new Error("Biometric login failed");

    // Now sign in via NextAuth using a special biometric provider
    // (see auth.ts addition below)
    const { user } = await verRes.json();
    await signIn("credentials", {
      email: user.email,
      biometricUserId: user.id,
      redirect: false,
    });

    return true;
  }

  return { registerBiometric, loginWithBiometric };
}
