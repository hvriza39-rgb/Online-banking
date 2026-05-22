import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/register-form";
import { ShieldCheck, Zap, Globe } from "lucide-react";

export const metadata: Metadata = { title: "Create Account — NexaBank" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col justify-between p-12 bg-[#0f2419] relative overflow-hidden">
        {/* Subtle grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth=".5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute -top-32 -right-32 w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(30,122,82,0.25)_0%,transparent_65%)] pointer-events-none" />

        {/* Logo */}
        <Image
          src="/nexabank-logo.svg"
          alt="NexaBank"
          width={150}
          height={46}
          className="h-11 w-auto relative z-10 brightness-0 invert"
          priority
        />

        {/* Copy */}
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#1e7a52] mb-5">
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
                <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 bg-[#1e7a52]/25 border border-[#1e7a52]/40 flex items-center justify-center text-[#1e7a52]">
                  <Icon className="w-2.5 h-2.5" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#c8dfd5] mb-0.5">{title}</p>
                  <p className="text-[12.5px] text-[#6a8c7a] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-[#2d5042] relative">© 2025 NexaBank · All rights reserved.</p>
      </div>

      {/* ── Right: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f2f9f6]">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="mb-7 lg:hidden flex justify-center">
            <Image
              src="/nexabank-logo.svg"
              alt="NexaBank"
              width={150}
              height={46}
              className="h-11 w-auto"
              priority
            />
          </div>

          <div className="mb-7">
            <h1 className="text-[24px] font-black text-[#0f2419] tracking-[-0.04em] mb-1.5">
              Create your account
            </h1>
            <p className="text-[14px] text-[#6a8c7a]">
              Get started with NexaBank — it&apos;s free
            </p>
          </div>

          <div className="bg-white border border-[#c8dfd5] rounded-2xl p-6 shadow-[0_1px_12px_rgba(15,36,25,0.06)]">
            <RegisterForm />
          </div>

          <p className="text-center text-[13.5px] text-[#6a8c7a] mt-5">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1e7a52] font-bold underline underline-offset-2 hover:text-[#185f40] transition-colors"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
