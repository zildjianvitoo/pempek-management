"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "@/src/components/ui/input";
import Button from "@/src/components/ui/button";
import Label from "@/src/components/ui/label";
import { useMemo, useState } from "react";
import { useBasicTable, type ColumnDef } from "@/src/lib/table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

type Branch = {
  id: string;
  name: string;
  address?: string | null;
};

export default function BranchesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<Branch[]>({ queryKey: ["branches"], queryFn: () => fetch("/api/branches").then((r) => r.json()) });
  const [form, setForm] = useState({ name: "", address: "" });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/branches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Gagal menambah cabang");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });

  const table = useBasicTable<Branch>({
    data: data || [],
    columns,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Cabang</h1>
        <p className="text-sm text-neutral-600">Kelola daftar cabang aktif.</p>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h2 className="font-medium mb-3">Tambah Cabang</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name" className="mb-1 block">Nama</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address" className="mb-1 block">Alamat</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
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
          <div className="font-medium">Daftar Cabang</div>
          <div className="w-64">
            <Input placeholder="Cari nama/alamat..." onChange={(e) => table.setGlobalFilter(e.target.value)} />
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
                      <TableHead key={h.id} className="select-none">
                        {h.isPlaceholder ? null : (
                          <button
                            className="inline-flex items-center gap-1 hover:text-neutral-900"
                            onClick={h.column.getToggleSortingHandler()}
                          >
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

const columns: ColumnDef<Branch, any>[] = [
  { accessorKey: "name", header: "Nama" },
  { accessorKey: "address", header: "Alamat", cell: ({ getValue }) => <span className="text-neutral-600">{getValue<string>() || "-"}</span> },
];
