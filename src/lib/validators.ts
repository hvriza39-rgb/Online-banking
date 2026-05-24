import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  currency: z.enum(["USD", "EUR"], { errorMap: () => ({ message: "Select USD or EUR" }) }),
});

export const fundAccountSchema = z.object({
  userId: z.string().min(1),
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than 0")
    .max(1_000_000, "Maximum single transaction is 1,000,000"),
  type: z.enum(["CREDIT", "DEBIT"]),
  note: z.string().max(200).optional(),
});

export const withdrawalRequestSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),
  sendType: z.enum(["LOCAL", "INTERNATIONAL"], {
    errorMap: () => ({ message: "Select a transfer type" }),
  }),
  recipientAccountNumber: z
    .string()
    .min(1, "Recipient account number is required")
    .max(34, "Account number is too long"),
  recipientName: z
    .string()
    .min(2, "Recipient name is required")
    .max(100, "Name is too long"),
  recipientBankName: z
    .string()
    .min(2, "Bank name is required")
    .max(100, "Bank name is too long"),
  recipientCountry: z.string().max(100).optional(),
  routingCode: z
    .string()
    .min(1, "Routing number / sort code is required")
    .max(20, "Routing code is too long"),
  note: z.string().max(200).optional(),
});

export const withdrawalActionSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().max(200).optional(),
});

export type LoginInput             = z.infer<typeof loginSchema>;
export type RegisterInput          = z.infer<typeof registerSchema>;
export type FundAccountInput       = z.infer<typeof fundAccountSchema>;
export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type WithdrawalActionInput  = z.infer<typeof withdrawalActionSchema>;
