import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0d0f13 0%, #13151a 50%, #0d0f13 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #c98a10, #e5a825)", boxShadow: "0 4px 12px rgba(201,138,16,0.35)" }}>
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-semibold text-white">NexaBank</span>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm">Get started with NexaBank today</p>
        </div>

        <div className="rounded-2xl p-7 shadow-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <RegisterForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "#c98a10" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
