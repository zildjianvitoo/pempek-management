import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create branches
  const pusat = await prisma.branch.upsert({
    where: { code: "PST" },
    update: {},
    create: { code: "PST", name: "Pusat", address: "Jl. Contoh 123", isActive: true },
  });

  // Create users (Owner, Kasir)
  // Note: hash is placeholder; will be replaced when NextAuth is added.
  await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Owner",
      email: "owner@example.com",
      hash: "changeme", // replace with bcrypt hash later
      role: "OWNER",
    },
  });

  const kasir = await prisma.user.upsert({
    where: { email: "kasir@pusat.example.com" },
    update: {},
    create: {
      name: "Kasir Pusat",
      email: "kasir@pusat.example.com",
      hash: "changeme", // replace with bcrypt hash later
      role: "KASIR",
      branchId: pusat.id,
    },
  });

  // Seed products
  const products = [
    { sku: "LENJER-S", name: "Lenjer (S)", category: "Lenjer", unit: "pcs", cost: "2500", price: "4000" },
    { sku: "LENJER-M", name: "Lenjer (M)", category: "Lenjer", unit: "pcs", cost: "3500", price: "6000" },
    { sku: "KAPSEL", name: "Kapal Selam", category: "Kapal Selam", unit: "pcs", cost: "8000", price: "12000" },
    { sku: "KULIT", name: "Kulit", category: "Kulit", unit: "pcs", cost: "3000", price: "5000" },
    { sku: "ADAAN", name: "Adaan", category: "Adaan", unit: "pcs", cost: "2500", price: "4000" },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        category: p.category,
        unit: p.unit,
        isActive: true,
      },
    });

    // Global price (no branch) and branch-specific price for Pusat
    await prisma.price.create({
      data: {
        productId: product.id,
        price: p.price,
        cost: p.cost,
        effectiveAt: new Date(),
      },
    });
    await prisma.price.create({
      data: {
        productId: product.id,
        branchId: pusat.id,
        price: p.price,
        cost: p.cost,
        effectiveAt: new Date(),
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

