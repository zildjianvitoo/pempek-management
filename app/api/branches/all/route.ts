import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireAuth } from "@/src/server/authz";

export async function GET() {
  const { ok, status } = await requireAuth();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(branches);
}

