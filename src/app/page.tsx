// app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import HomePage from "@/components/home-page";
import { StandaloneGuard } from "@/components/standalone-guard";

export default async function Page() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <StandaloneGuard />
      <HomePage />
    </>
  );
}
