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
