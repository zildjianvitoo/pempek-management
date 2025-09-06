import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireOwner } from "@/src/server/authz";
import { PriceCreateSchema } from "@/src/server/validation";

export async function GET() {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const prices = await prisma.price.findMany({
    orderBy: [{ productId: "asc" }, { branchId: "asc" }],
    include: { product: true, branch: true },
  });
  return NextResponse.json(prices);
}

export async function POST(req: Request) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const body = await req.json();
  const parsed = PriceCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { productId, branchId, price } = parsed.data;
  const p = await prisma.price.create({ data: { productId, branchId: branchId ?? undefined, price } });
  return NextResponse.json(p, { status: 201 });
}
