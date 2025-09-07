import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireAuth } from "@/src/server/authz";
import { StockMutationSchema } from "@/src/server/validation";

export async function POST(req: Request) {
  const { ok, status } = await requireAuth();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });

  const body = await req.json();
  const parsed = StockMutationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { branchId, productId, direction, qty, reason, note } = parsed.data;
  const signedQty = direction === "IN" ? qty : -qty;

  const entry = await prisma.stockLedger.create({
    data: {
      branchId,
      productId,
      qty: signedQty,
      reason: reason as any,
      refType: "Mutation",
      refId: null,
      note: note ?? undefined,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

