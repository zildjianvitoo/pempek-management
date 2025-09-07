import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create branches by name only
  let pusat = await prisma.branch.findFirst({ where: { name: "Pusat" } });
  if (!pusat) {
    pusat = await prisma.branch.create({ data: { name: "Pusat", address: "Jl. Contoh 123" } });
  }

  // Create users (Owner, Kasir) — with hashed passwords
  const ownerPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Owner",
      email: "owner@example.com",
      hash: ownerPassword,
      role: "OWNER",
    },
  });

  const kasirPassword = await bcrypt.hash("kasir123", 10);
  await prisma.user.upsert({
    where: { email: "kasir@pusat.example.com" },
    update: {},
    create: {
      name: "Kasir Pusat",
      email: "kasir@pusat.example.com",
      hash: kasirPassword,
      role: "KASIR",
      branchId: pusat.id,
    },
  });

  // Seed products
  const products = [
    { name: "Lenjer (S)", category: "Lenjer", unit: "pcs", price: "4000" },
    { name: "Lenjer (M)", category: "Lenjer", unit: "pcs", price: "6000" },
    { name: "Kapal Selam", category: "Kapal Selam", unit: "pcs", price: "12000" },
    { name: "Kulit", category: "Kulit", unit: "pcs", price: "5000" },
    { name: "Adaan", category: "Adaan", unit: "pcs", price: "4000" },
  ];

  for (const p of products) {
    let product = await prisma.product.findFirst({ where: { name: p.name } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: p.name,
          category: p.category,
          unit: p.unit,
        },
      });
    }

    // Global price (no branch) and branch-specific price for Pusat
    await prisma.price.create({ data: { productId: product.id, price: p.price } });
    await prisma.price.create({
      data: {
        productId: product.id,
        branchId: pusat.id,
        price: p.price,
      },
    });
  }

  // Initial opening cash example via DailyClose opening for today (optional)
  const today = new Date();
  const dateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  await prisma.dailyClose.upsert({
    where: { branchId_date: { branchId: pusat.id, date: dateOnly } },
    update: {},
    create: {
      branchId: pusat.id,
      date: dateOnly,
      openingCash: "0",
      expectedCash: "0",
      actualCash: "0",
      diff: "0",
    },
  });

  console.log("Seed complete. Owner + Kasir + sample products created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
