import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { ShieldCheck, Zap, Globe } from "lucide-react";

export const metadata: Metadata = { title: "Create Account — NexaBank" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col justify-between p-12 bg-[#0c0e12] relative overflow-hidden">
        {/* Grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth=".5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute -top-32 -right-32 w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(26,144,104,0.2)_0%,transparent_65%)] pointer-events-none" />

        {/* Logo */}
        <NexaLogo />

        {/* Copy */}
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#1a9068] mb-5">
            Trusted banking
          </p>
          <h2 className="text-[32px] font-black text-white leading-[1.18] tracking-[-0.04em] mb-9">
            Simple, secure<br />banking for<br />everyone.
          </h2>
          <div className="flex flex-col gap-5">
            {[
              { Icon: ShieldCheck, title: "Bank-grade security",  desc: "256-bit encryption on every account." },
              { Icon: Zap,         title: "Instant updates",      desc: "Real-time balance after every transaction." },
              { Icon: Globe,       title: "USD & EUR support",    desc: "Hold multiple currencies in one place." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5">
                <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 bg-[#1a9068]/25 border border-[#1a9068]/40 flex items-center justify-center text-[#1a9068]">
                  <Icon className="w-2.5 h-2.5" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#d0d4dc] mb-0.5">{title}</p>
                  <p className="text-[12.5px] text-[#636878] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-[#343840] relative">© 2025 NexaBank · All rights reserved.</p>
      </div>

      {/* ── Right: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f8f9fb]">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="mb-7 lg:hidden">
            <NexaLogo />
          </div>

          <div className="mb-7">
            <h1 className="text-[24px] font-black text-[#0c0e12] tracking-[-0.04em] mb-1.5">Create your account</h1>
            <p className="text-[14px] text-[#4b5262]">Get started with NexaBank — it&apos;s free</p>
          </div>

          <div className="bg-white border border-[#e2e5ea] rounded-2xl p-6 shadow-[0_1px_12px_rgba(12,14,18,0.05)]">
            <RegisterForm />
          </div>

          <p className="text-center text-[13.5px] text-[#9aa0ad] mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0c0e12] font-bold underline underline-offset-2 hover:opacity-60 transition-opacity">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function NexaLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-[7px] bg-white flex items-center justify-center flex-shrink-0">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1.3" fill="#1a9068" />
          <rect x="9" y="2" width="5" height="5" rx="1.3" fill="#0c0e12" opacity=".4" />
          <rect x="2" y="9" width="5" height="5" rx="1.3" fill="#0c0e12" opacity=".4" />
          <rect x="9" y="9" width="5" height="5" rx="1.3" fill="#1a9068" opacity=".6" />
        </svg>
      </div>
      <span className="text-[16px] font-extrabold text-white tracking-[-0.035em]">NexaBank</span>
    </div>
  );
}
