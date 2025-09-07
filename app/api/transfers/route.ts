import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { requireAuth } from "@/src/server/authz";
import { TransferCreateSchema } from "@/src/server/validation";

export async function GET(req: Request) {
  const { ok, status } = await requireAuth();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const where = branchId
    ? { OR: [{ fromBranchId: branchId }, { toBranchId: branchId }] }
    : {};
  const transfers = await prisma.transfer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: true, fromBranch: true, toBranch: true },
    take: 100,
  });
  return NextResponse.json(transfers);
}

export async function POST(req: Request) {
  const { ok, status, session } = await requireAuth();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status });
  const body = await req.json();
  const parsed = TransferCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { fromBranchId, toBranchId, items } = parsed.data;
  if (fromBranchId === toBranchId)
    return NextResponse.json({ error: "fromBranchId and toBranchId must differ" }, { status: 400 });

  const transfer = await prisma.$transaction(async (tx) => {
    const t = await tx.transfer.create({
      data: {
        fromBranchId,
        toBranchId,
        createdById: (session!.user as any).id as string,
        status: "COMPLETED",
        items: { create: items.map((it) => ({ productId: it.productId, qty: it.qty })) },
      },
    });

    // Twin-ledger for each item
    for (const it of items) {
      await tx.stockLedger.create({
        data: {
          branchId: fromBranchId,
          productId: it.productId,
          qty: -it.qty,
          reason: "TRANSFER_OUT",
          refType: "Transfer",
          refId: t.id,
        },
      });
      await tx.stockLedger.create({
        data: {
          branchId: toBranchId,
          productId: it.productId,
          qty: it.qty,
          reason: "TRANSFER_IN",
          refType: "Transfer",
          refId: t.id,
        },
      });
    }

    return t;
  });

  return NextResponse.json(transfer, { status: 201 });
}

