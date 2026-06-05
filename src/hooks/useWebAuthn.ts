"use client";

import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { signIn } from "next-auth/react";

export function useWebAuthn() {
  async function registerBiometric(deviceName?: string) {
    const optRes = await fetch("/api/auth/webauthn/register-options");
    if (!optRes.ok) throw new Error("Failed to get registration options");
    const options = await optRes.json();

    const credential = await startRegistration(options);

    const verRes = await fetch("/api/auth/webauthn/register-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, deviceName }),
    });

    if (!verRes.ok) throw new Error("Registration failed");
    return true;
  }

  async function loginWithBiometric() {
    const optRes = await fetch("/api/auth/webauthn/login-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!optRes.ok) throw new Error("Failed to get login options");
    const options = await optRes.json();

    const credential = await startAuthentication(options);

    const verRes = await fetch("/api/auth/webauthn/login-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    if (!verRes.ok) throw new Error("Biometric login failed");

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
