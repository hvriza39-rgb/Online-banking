"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, MoreHorizontal } from "lucide-react";

type Mode = "android" | "ios" | null;

export default function InstallPrompt() {
  const [prompt, setPrompt]       = useState<any>(null);
  const [mode, setMode]           = useState<Mode>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [iosExpanded, setIosExpanded] = useState(false);

  useEffect(() => {
    // Already running as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // iOS detection
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIos && isSafari) {
      setMode("ios");
      return;
    }

    // Android/Chrome — intercept beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      setMode("android");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  if (installed || dismissed || !mode) return null;

  // ── Android banner ────────────────────────────────────────────────────────
  if (mode === "android") {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-[#0f2419] rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[12px] bg-[#1e7a52] flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white leading-tight">Install NexaBank</p>
            <p className="text-[11px] text-[#6a8c7a] mt-0.5">Add to your home screen for the best experience</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={install}
              className="px-3 py-1.5 bg-[#1e7a52] hover:bg-[#2d9966] text-white text-[12px] font-bold rounded-xl transition-colors">
              Install
            </button>
            <button onClick={() => setDismissed(true)}
              className="w-7 h-7 rounded-full bg-[#1a2e22] flex items-center justify-center hover:bg-[#243d2c] transition-colors">
              <X className="w-3.5 h-3.5 text-[#6a8c7a]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── iOS banner ────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-[#0f2419] rounded-2xl shadow-2xl overflow-hidden">

        {/* Collapsed row */}
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-[12px] bg-[#1e7a52] flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white leading-tight">Install NexaBank</p>
            <p className="text-[11px] text-[#6a8c7a] mt-0.5">Add to your home screen</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setIosExpanded(v => !v)}
              className="px-3 py-1.5 bg-[#1e7a52] hover:bg-[#2d9966] text-white text-[12px] font-bold rounded-xl transition-colors">
              {iosExpanded ? "Hide" : "How?"}
            </button>
            <button onClick={() => setDismissed(true)}
              className="w-7 h-7 rounded-full bg-[#1a2e22] flex items-center justify-center hover:bg-[#243d2c] transition-colors">
              <X className="w-3.5 h-3.5 text-[#6a8c7a]" />
            </button>
          </div>
        </div>

        {/* Expanded instructions */}
        {iosExpanded && (
          <div className="border-t border-[#1a2e22] px-5 py-4 space-y-3">
            <p className="text-[11px] text-[#6a8c7a] leading-relaxed">
              Safari on iOS doesn't support automatic install prompts. Follow these steps:
            </p>

            {[
              {
                icon: <Share className="w-4 h-4 text-[#4daa80]" />,
                step: "1",
                text: "Tap the Share button at the bottom of Safari",
              },
              {
                icon: (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <span className="text-[#4daa80] text-[13px] font-bold">+</span>
                  </div>
                ),
                step: "2",
                text: 'Scroll down and tap "Add to Home Screen"',
              },
              {
                icon: <Download className="w-4 h-4 text-[#4daa80]" strokeWidth={1.8} />,
                step: "3",
                text: 'Tap "Add" in the top right corner',
              },
            ].map(({ icon, step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1a2e22] border border-[#2d4a35] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {icon}
                </div>
                <p className="text-[12px] text-white leading-relaxed pt-1">{text}</p>
              </div>
            ))}

            {/* Visual hint arrow pointing down toward Safari bar */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1a2e22]">
              <div className="w-6 h-6 rounded-lg bg-[#1a2e22] border border-[#2d4a35] flex items-center justify-center">
                <Share className="w-3.5 h-3.5 text-[#4daa80]" />
              </div>
              <p className="text-[10px] text-[#6a8c7a]">
                The share icon looks like a box with an arrow pointing up
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
