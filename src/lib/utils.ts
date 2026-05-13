import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency } from "@prisma/client";

// ── Tailwind class merge helper ───────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Money helpers ─────────────────────────────────────────
// Amounts are stored in cents. 100 cents = 1 major unit.

export function centsToMajor(cents: number): number {
  return cents / 100;
}

export function majorToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatMoney(cents: number, currency: Currency): string {
  const symbol = currency === "USD" ? "$" : "€";
  const amount = centsToMajor(cents);
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function currencySymbol(currency: Currency): string {
  return currency === "USD" ? "$" : "€";
}

// ── Date helpers ──────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Initials ──────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
