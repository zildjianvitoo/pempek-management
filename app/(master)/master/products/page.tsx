"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "@/src/components/ui/input";
import Button from "@/src/components/ui/button";
import Label from "@/src/components/ui/label";
import { useState } from "react";
import { useBasicTable, type ColumnDef } from "@/src/lib/table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

type Product = {
  id: string;
  name: string;
  category?: string | null;
  unit?: string | null;
};

export default function ProductsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<Product[]>({ queryKey: ["products"], queryFn: () => fetch("/api/products").then((r) => r.json()) });
  const [form, setForm] = useState({ name: "", category: "", unit: "" });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Gagal menambah produk");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const table = useBasicTable<Product>({
    data: data || [],
    columns,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Produk</h1>
        <p className="text-sm text-neutral-600">Kelola produk: kategori dan unit.</p>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h2 className="font-medium mb-3">Tambah Produk</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="name" className="mb-1 block">Nama</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="category" className="mb-1 block">Kategori</Label>
            <Input id="category" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="unit" className="mb-1 block">Unit</Label>
            <Input id="unit" value={form.unit} onChange={(e) => setForm((s) => ({ ...s, unit: e.target.value }))} />
          </div>
        </div>
        <div className="mt-3">
          <Button
            onClick={() => create.mutate({ ...form })}
            disabled={create.isPending || !form.name}
          >
            Simpan
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-2">
          <div className="font-medium">Daftar Produk</div>
          <div className="w-64">
            <Input placeholder="Cari nama/kategori..." onChange={(e) => table.setGlobalFilter(e.target.value)} />
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

const columns: ColumnDef<Product, any>[] = [
  { accessorKey: "name", header: "Nama" },
  { accessorKey: "category", header: "Kategori", cell: ({ getValue }) => <span className="text-neutral-600">{getValue<string>() || "-"}</span> },
  { accessorKey: "unit", header: "Unit", cell: ({ getValue }) => <span className="text-neutral-600">{getValue<string>() || "-"}</span> },
];
