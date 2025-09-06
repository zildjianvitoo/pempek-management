import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireOwner } from "@/src/server/authz";
import { ProductUpdateSchema } from "@/src/server/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const p = await prisma.product.findUnique({ where: { id: params.id } });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const body = await req.json();
  const parsed = ProductUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const p = await prisma.product.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(p);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({}, { status: 204 });
}

