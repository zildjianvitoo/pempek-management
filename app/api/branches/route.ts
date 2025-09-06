import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireOwner } from "@/src/server/authz";
import { BranchCreateSchema } from "@/src/server/validation";

export async function GET() {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(branches);
}

export async function POST(req: Request) {
  const { ok, status } = await requireOwner();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const body = await req.json();
  const parsed = BranchCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const b = await prisma.branch.create({ data: parsed.data });
  return NextResponse.json(b, { status: 201 });
}

