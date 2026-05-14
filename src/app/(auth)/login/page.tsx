import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Wallet, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0d0f13 0%, #13151a 50%, #0d0f13 100%)" }}>
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12"
        style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #c98a10, #e5a825)", boxShadow: "0 4px 12px rgba(201,138,16,0.35)" }}>
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
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(201,138,16,0.15)", border: "1px solid rgba(201,138,16,0.25)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: "#c98a10" }} />
                </div>
                <span className="text-slate-400 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2025 NexaBank. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c98a10, #e5a825)" }}>
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">NexaBank</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your account</p>
          </div>

          <div className="rounded-2xl p-7 shadow-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <LoginForm />
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium" style={{ color: "#c98a10" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
