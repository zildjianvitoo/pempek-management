import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireOwner } from "@/src/server/authz";
import { ProductCreateSchema } from "@/src/server/validation";

export async function GET() {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const body = await req.json();
  const parsed = ProductCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const p = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(p, { status: 201 });
}

