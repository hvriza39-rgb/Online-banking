import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Currency } from "@prisma/client";

// ── Tailwind class merge ──────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Money ─────────────────────────────────────────────────
// All amounts stored as cents (integers). 100 cents = 1 major unit.

export function centsToMajor(cents: number | bigint): number {
  return Number(cents) / 100;
}

export function majorToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatMoney(cents: number | bigint, currency: Currency): string {
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

// ── Account number generation ─────────────────────────────
// Format: 10-digit number, prefix "92" + 8 random digits
// Uniqueness is enforced at the DB level (unique constraint)

export function generateAccountNumber(): string {
  const prefix = "92";
  const random = Math.floor(Math.random() * 99_999_999)
    .toString()
    .padStart(8, "0");
  return `${prefix}${random}`;
}

// Mask for display: show first 2 and last 4, e.g. 92••••3421
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length < 6) return accountNumber;
  const visible = accountNumber.slice(-4);
  return `${accountNumber.slice(0, 2)}${"•".repeat(accountNumber.length - 6)}${visible}`;
}

// ── Dates ─────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Misc ──────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
