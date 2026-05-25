import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import SWRegister from "./sw-register";

const sora = Sora({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "NexaBank", template: "%s | NexaBank" },
  description: "Secure online banking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NexaBank",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e7a52",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.variable}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
        <SWRegister />
      </body>
    </html>
  );
}
