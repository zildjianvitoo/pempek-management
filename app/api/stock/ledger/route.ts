import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireAuth } from "@/src/server/authz";

export async function GET(req: Request) {
  const { ok, status } = await requireAuth();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const productId = searchParams.get("productId");
  if (!branchId || !productId)
    return NextResponse.json({ error: "branchId and productId required" }, { status: 400 });

  const rows = await prisma.stockLedger.findMany({
    where: { branchId, productId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(rows);
}

