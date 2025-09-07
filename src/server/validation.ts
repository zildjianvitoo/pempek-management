import { z } from "zod";

export const BranchCreateSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().nullable(),
});

export const BranchUpdateSchema = BranchCreateSchema.partial();

export const ProductCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const PriceCreateSchema = z.object({
  productId: z.string().min(1),
  branchId: z.string().optional().nullable(),
  price: z.string().min(1),
});

// M4 – Stok & Mutasi
export const StockMutationSchema = z.object({
  branchId: z.string().min(1),
  productId: z.string().min(1),
  direction: z.enum(["IN", "OUT"]),
  qty: z.number().int().positive(),
  reason: z.enum([
    "PRODUKSI",
    "PENJUALAN",
    "RETUR",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "WASTE",
    "PENYESUAIAN",
  ]),
  note: z.string().optional().nullable(),
});

export const TransferItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive(),
});

export const TransferCreateSchema = z.object({
  fromBranchId: z.string().min(1),
  toBranchId: z.string().min(1),
  items: z.array(TransferItemSchema).min(1),
});
