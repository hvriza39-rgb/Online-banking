import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f2f9f6] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/nexabank-logo.svg"
              alt="NexaBank"
              width={160}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[#0f2419]">Welcome back</h1>
          <p className="text-sm text-[#6a8c7a] mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#c8dfd5] shadow-sm p-8">
          <LoginForm />
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-[#6a8c7a] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#1e7a52] hover:text-[#185f40] font-semibold transition-colors">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}
