import { PrismaClient, Role, Currency } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  const adminHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexabank.com" },
    update: {},
    create: {
      email: "admin@nexabank.com",
      name: "Super Admin",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Demo user 1
  const user1Hash = await bcrypt.hash("User@12345", 12);
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Johnson",
      passwordHash: user1Hash,
      role: Role.USER,
      account: {
        create: {
          balance: 250000, // $2,500.00
          currency: Currency.USD,
        },
      },
    },
  });
  console.log("✅ User created:", user1.email);

  // Demo user 2
  const user2Hash = await bcrypt.hash("User@12345", 12);
  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Smith",
      passwordHash: user2Hash,
      role: Role.USER,
      account: {
        create: {
          balance: 180000, // €1,800.00
          currency: Currency.EUR,
        },
      },
    },
  });
  console.log("✅ User created:", user2.email);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("Admin:  admin@nexabank.com  /  Admin@12345");
  console.log("User 1: alice@example.com   /  User@12345");
  console.log("User 2: bob@example.com     /  User@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
