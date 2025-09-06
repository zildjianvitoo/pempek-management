import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireOwner } from "@/src/server/authz";
import { BranchUpdateSchema } from "@/src/server/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const b = await prisma.branch.findUnique({ where: { id: params.id } });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(b);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const body = await req.json();
  const parsed = BranchUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const b = await prisma.branch.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(b);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  await prisma.branch.delete({ where: { id: params.id } });
  return NextResponse.json({}, { status: 204 });
}

