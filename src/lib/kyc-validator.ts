import { z } from "zod";

export const kycSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const dob  = new Date(val);
      const now  = new Date();
      const age  = now.getFullYear() - dob.getFullYear();
      return age >= 18;
    }, "You must be at least 18 years old"),

  address: z
    .string()
    .min(10, "Please enter your full address")
    .max(300),

  idType: z.enum(["PASSPORT", "NATIONAL_ID", "DRIVERS_LICENSE"], {
    errorMap: () => ({ message: "Select a valid ID type" }),
  }),

  idNumber: z
    .string()
    .min(4, "ID number must be at least 4 characters")
    .max(30, "ID number is too long")
    .regex(/^[A-Za-z0-9\-]+$/, "ID number can only contain letters, numbers and hyphens"),
});

export type KycInput = z.infer<typeof kycSchema>;
