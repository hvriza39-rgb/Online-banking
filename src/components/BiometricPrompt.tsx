"use client";

import { useState, useEffect } from "react";
import { Fingerprint, X } from "lucide-react";
import { useWebAuthn } from "@/hooks/useWebAuthn";
import { useRouter } from "next/navigation";

export function BiometricPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { registerBiometric } = useWebAuthn();
  const router = useRouter();

  useEffect(() => {
    // Only show once per session
    const dismissed = sessionStorage.getItem("biometric_prompt_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("biometric_prompt_dismissed", "1");
    setVisible(false);
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      await registerBiometric("My Device");
      setDone(true);
      setTimeout(() => {
        dismiss();
        router.refresh();
      }, 1500);
    } catch (e) {
      dismiss();
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-5 pointer-events-none">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#c8dfd5] shadow-2xl p-5 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-[14px] bg-[#edf7f5] border border-[#a8dbd4] flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-[#1e7a52]" />
          </div>
          <button onClick={dismiss} className="text-[#a8c8b8] hover:text-[#2d5042] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-2">
            <p className="text-[15px] font-semibold text-[#0f2419]">All set!</p>
            <p className="text-[12px] text-[#6a8c7a] mt-1">Biometric login is now enabled.</p>
          </div>
        ) : (
          <>
            <p className="text-[15px] font-semibold text-[#0f2419] leading-snug">
              Enable Face ID / Fingerprint?
            </p>
            <p className="text-[12px] text-[#6a8c7a] mt-1 mb-4 leading-relaxed">
              Sign in faster next time with biometric authentication. 
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl border border-[#c8dfd5] text-[13px] font-medium text-[#6a8c7a] hover:bg-[#f0f7f4] transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleSetup}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#1e7a52] text-[13px] font-bold text-white hover:bg-[#185f40] transition-colors disabled:opacity-50"
              >
                {loading ? "Setting up…" : "Enable"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
          }
