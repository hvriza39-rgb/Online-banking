import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f1e40] to-[#0d1525] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-semibold text-white">NexaBank</span>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm">Get started with NexaBank today</p>
        </div>

        <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7 shadow-xl">
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
