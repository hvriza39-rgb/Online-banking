import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { SessionGuard } from "@/components/session-guard";
import SWRegister from "./sw-register";

const sora = Sora({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "NexaBank", template: "%s | NexaBank" },
  description: "Secure online banking",
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e7a52",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.variable}>
        <Providers>
          <SessionGuard>
            {children}
            <Toaster position="top-right" richColors />
          </SessionGuard>
        </Providers>
        <SWRegister />
      </body>
    </html>
  );
}
