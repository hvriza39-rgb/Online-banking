async function loginWithBiometric() {
  // No email needed — get options without user hint
  const optRes = await fetch("/api/auth/webauthn/login-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}), // empty body
  });

  if (!optRes.ok) throw new Error("Failed to get login options");
  const options = await optRes.json();

  // Browser shows biometric prompt, passkey reveals who the user is
  const credential = await startAuthentication(options);

  // credential.response.userHandle contains the user ID
  const verRes = await fetch("/api/auth/webauthn/login-verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }), // no email
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
