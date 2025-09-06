"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "@/src/components/ui/input";
import Button from "@/src/components/ui/button";
import Label from "@/src/components/ui/label";
import { useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { useBasicTable, type ColumnDef } from "@/src/lib/table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

type Product = { id: string; name: string };
type Branch = { id: string; name: string };

type PriceRow = {
  id: string;
  productId: string;
  branchId?: string | null;
  price: string;
  product?: { name: string };
  branch?: { name: string } | null;
};

export default function PricesPage() {
  const qc = useQueryClient();
  const { data: products } = useQuery<Product[]>({ queryKey: ["products.min"], queryFn: () => fetch("/api/products").then((r) => r.json()) });
  const { data: branches } = useQuery<Branch[]>({ queryKey: ["branches.min"], queryFn: () => fetch("/api/branches").then((r) => r.json()) });
  const { data: prices, isLoading } = useQuery<PriceRow[]>({ queryKey: ["prices"], queryFn: () => fetch("/api/prices").then((r) => r.json()) });

  const [productId, setProductId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [price, setPrice] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId!, branchId, price }),
      });
      if (!res.ok) throw new Error("Gagal menambah harga");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prices"] }),
  });

  const canSave = productId && price;

  const table = useBasicTable<PriceRow>({ data: prices || [], columns, pageSize: 10 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Harga</h1>
        <p className="text-sm text-neutral-600">Atur harga per produk dan per cabang (opsional).</p>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4 space-y-3">
        <h2 className="font-medium">Tambah Harga</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <Label className="mb-1 block">Produk</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-left shadow-sm hover:bg-neutral-50">
                  {products?.find((p) => p.id === productId)?.name || "Pilih produk"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="mt-2 max-h-64 overflow-auto">
                {products?.map((p) => (
                  <DropdownMenuItem key={p.id} onSelect={() => setProductId(p.id)}>
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Label className="mb-1 block">Cabang (opsional)</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-left shadow-sm hover:bg-neutral-50">
                  {branchId ? branches?.find((b) => b.id === branchId)?.name : "Global"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="mt-2 max-h-64 overflow-auto">
                <DropdownMenuItem onSelect={() => setBranchId(null)}>Global</DropdownMenuItem>
                {branches?.map((b) => (
                  <DropdownMenuItem key={b.id} onSelect={() => setBranchId(b.id)}>
                    {b.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Label className="mb-1 block">Harga</Label>
            <Input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className="font-mono" />
          </div>
          
        </div>
        <div>
          <Button onClick={() => create.mutate()} disabled={!canSave || create.isPending}>Simpan</Button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-2">
          <div className="font-medium">Riwayat Harga</div>
          <div className="w-64">
            <Input placeholder="Cari produk/cabang..." onChange={(e) => table.setGlobalFilter(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-neutral-600">Memuat...</div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : (
                          <button className="inline-flex items-center gap-1" onClick={h.column.getToggleSortingHandler()}>
                            {h.column.columnDef.header as any}
                            {{ asc: "▲", desc: "▼" }[h.column.getIsSorted() as string] || null}
                          </button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{cell.renderValue() as any}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="py-6 text-center text-sm text-neutral-600" colSpan={table.getAllColumns().length}>
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

const columns: ColumnDef<PriceRow, any>[] = [
  { accessorKey: "product.name", header: "Produk", cell: ({ row }) => row.original.product?.name },
  { accessorKey: "branch.name", header: "Cabang", cell: ({ row }) => row.original.branch?.name || "Global" },
  { accessorKey: "price", header: "Harga", cell: ({ getValue }) => <span className="font-mono tabular-nums">{getValue<string>()}</span> },
];
