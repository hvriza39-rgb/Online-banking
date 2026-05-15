import { PrismaClient, Role, Currency, KycStatus, IdType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateAccountNumber(): string {
  const prefix = "92";
  const random = Math.floor(Math.random() * 99999999).toString().padStart(8, "0");
  return `${prefix}${random}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin ──────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@12345", 12);
  await prisma.user.upsert({
    where:  { email: "admin@nexabank.com" },
    update: {},
    create: {
      email:        "admin@nexabank.com",
      name:         "Super Admin",
      passwordHash: adminHash,
      role:         Role.ADMIN,
      kycStatus:    KycStatus.VERIFIED,
    },
  });
  console.log("✅ Admin:  admin@nexabank.com / Admin@12345");

  // ── Demo User 1 — KYC verified ────────────────────────
  const hash1 = await bcrypt.hash("User@12345", 12);
  const user1 = await prisma.user.upsert({
    where:  { email: "alice@example.com" },
    update: {},
    create: {
      email:        "alice@example.com",
      name:         "Alice Johnson",
      passwordHash: hash1,
      role:         Role.USER,
      kycStatus:    KycStatus.VERIFIED,
      kyc: {
        create: {
          fullName:    "Alice Marie Johnson",
          dateOfBirth: new Date("1990-04-15"),
          address:     "12 Maple Street, New York, NY 10001",
          idType:      IdType.PASSPORT,
          idNumber:    "P123456789",
          verifiedAt:  new Date(),
        },
      },
      account: {
        create: {
          accountNumber: generateAccountNumber(),
          balance:       250000, // $2,500.00
          currency:      Currency.USD,
        },
      },
    },
  });
  console.log("✅ User 1: alice@example.com / User@12345 (KYC verified)");

  // ── Demo User 2 — KYC pending (no account number) ─────
  const hash2 = await bcrypt.hash("User@12345", 12);
  await prisma.user.upsert({
    where:  { email: "bob@example.com" },
    update: {},
    create: {
      email:        "bob@example.com",
      name:         "Bob Smith",
      passwordHash: hash2,
      role:         Role.USER,
      kycStatus:    KycStatus.PENDING,
      account: {
        create: {
          accountNumber: null,
          balance:       0,
          currency:      Currency.EUR,
        },
      },
    },
  });
  console.log("✅ User 2: bob@example.com / User@12345 (KYC pending — see banner)");

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────────────");
  console.log("Admin:  admin@nexabank.com  →  Admin@12345");
  console.log("User 1: alice@example.com   →  User@12345  (verified)");
  console.log("User 2: bob@example.com     →  User@12345  (pending KYC)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
