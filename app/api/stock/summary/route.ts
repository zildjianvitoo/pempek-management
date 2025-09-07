import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireAuth } from "@/src/server/authz";

export async function GET(req: Request) {
  const { ok, status } = await requireAuth();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId required" }, { status: 400 });

  // Aggregate saldo and last mutation per product for this branch
  const [products, agg, prices] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.stockLedger.groupBy({
      by: ["productId"],
      where: { branchId },
      _sum: { qty: true },
      _max: { createdAt: true },
    }),
    prisma.price.findMany({
      where: { OR: [{ branchId }, { branchId: null }] },
      orderBy: [{ branchId: "desc" }], // prefer branch-specific over global
    }),
  ]);

  const aggMap = new Map<string, { saldo: number; last: Date | null }>();
  for (const a of agg) {
    aggMap.set(a.productId, { saldo: Number(a._sum.qty ?? 0), last: a._max.createdAt ?? null });
  }

  const priceMap = new Map<string, string>();
  for (const p of prices) {
    // first occurrence after orderBy gives branch price priority
    if (!priceMap.has(p.productId)) priceMap.set(p.productId, String(p.price));
  }

  const rows = products.map((p) => {
    const a = aggMap.get(p.id) ?? { saldo: 0, last: null };
    return {
      productId: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      price: priceMap.get(p.id) ?? null,
      saldo: a.saldo,
      lastMutationAt: a.last,
    };
  });

  return NextResponse.json(rows);
}

