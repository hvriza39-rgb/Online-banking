import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Wallet, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f1e40] to-[#0d1525] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 border-r border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-semibold text-white text-[15px]">NexaBank</span>
        </div>

        <div>
          <h2 className="text-3xl font-semibold text-white leading-tight mb-4">
            Simple, secure<br />banking for<br />everyone.
          </h2>
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: "Bank-grade security on every account" },
              { icon: Zap,         text: "Instant balance updates" },
              { icon: Wallet,      text: "USD and EUR support" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-slate-400 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2025 NexaBank. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">NexaBank</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your account</p>
          </div>

          <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-7 shadow-xl">
            <LoginForm />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
