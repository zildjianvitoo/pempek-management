"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Input from "@/src/components/ui/input";
import Button from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { X as XIcon } from "@/src/components/ui/icons";
import { useSession } from "next-auth/react";

type Branch = { id: string; name: string };

function formatCurrency(x: string | number | null | undefined) {
  const n = typeof x === "string" ? Number(x) : x ?? 0;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat("id-ID").format(n);
}

export default function StockPage() {
  const { data: session } = useSession();
  const qc = useQueryClient();

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["branches", "all"],
    queryFn: async () => {
      const res = await fetch("/api/branches/all");
      if (!res.ok) throw new Error("Failed to load branches");
      return res.json();
    },
  });

  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // default to user's branch if exists, else first branch
    const fromSession = (session?.user as any)?.branchId as string | null | undefined;
    if (!branchId && branches.length) {
      setBranchId(fromSession ?? branches[0].id);
    }
  }, [branches, branchId, session]);

  const { data: summary = [], isLoading } = useQuery<any[]>({
    queryKey: ["stock", "summary", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const res = await fetch(`/api/stock/summary?branchId=${branchId}`);
      if (!res.ok) throw new Error("Failed to load stock summary");
      return res.json();
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return summary;
    return summary.filter((r) =>
      [r.name, r.category, r.unit].some((v: string | null) => (v || "").toLowerCase().includes(q))
    );
  }, [summary, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <Input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Memuat...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Tidak ada data</TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <StockRow
                  key={row.productId}
                  branchId={branchId!}
                  row={row}
                  onChanged={() => qc.invalidateQueries({ queryKey: ["stock", "summary", branchId] })}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StockRow({
  branchId,
  row,
  onChanged,
}: {
  branchId: string;
  row: any;
  onChanged: () => void;
}) {
  const qc = useQueryClient();

  const mutateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/stock/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan mutasi");
      return res.json();
    },
    onSuccess: () => {
      onChanged();
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan transfer");
      return res.json();
    },
    onSuccess: () => {
      onChanged();
    },
  });

  const { data: ledger = [], refetch: refetchLedger } = useQuery<any[]>({
    queryKey: ["stock", "ledger", branchId, row.productId],
    enabled: false, // fetch on open
    queryFn: async () => {
      const res = await fetch(`/api/stock/ledger?branchId=${branchId}&productId=${row.productId}`);
      if (!res.ok) throw new Error("Gagal memuat kartu stok");
      return res.json();
    },
  });

  const [open, setOpen] = useState<null | "mutasi" | "transfer" | "kartu">(null);

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{row.name}</div>
        <div className="text-xs text-neutral-500">{row.category || "-"}</div>
      </TableCell>
      <TableCell>{row.price ? formatCurrency(row.price) : "-"}</TableCell>
      <TableCell className="font-mono">{formatNumber(row.saldo)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">Aksi ▾</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => setOpen("mutasi")}>Mutasi</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpen("transfer")}>Transfer</DropdownMenuItem>
            <DropdownMenuItem onSelect={async () => { setOpen("kartu"); await refetchLedger(); }}>Kartu Stok</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mutasi Dialog */}
        <Dialog open={open === "mutasi"} onOpenChange={(v) => !v && setOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Mutasi Stok — {row.name}</DialogTitle>
                <DialogClose asChild>
                  <button
                    aria-label="Tutup"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    <XIcon className="size-4" />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="p-4">
              <MutasiForm
                onSubmit={async (payload) => {
                  await mutateMutation.mutateAsync({ ...payload, branchId, productId: row.productId });
                  setOpen(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Transfer Dialog */}
        <Dialog open={open === "transfer"} onOpenChange={(v) => !v && setOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Transfer Stok — {row.name}</DialogTitle>
                <DialogClose asChild>
                  <button
                    aria-label="Tutup"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    <XIcon className="size-4" />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="p-4">
              <TransferForm
                currentBranchId={branchId}
                productId={row.productId}
                onSubmit={async (payload) => {
                  await transferMutation.mutateAsync(payload);
                  setOpen(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Kartu Dialog */}
        <Dialog open={open === "kartu"} onOpenChange={(v) => !v && setOpen(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Kartu Stok — {row.name}</DialogTitle>
                <DialogClose asChild>
                  <button
                    aria-label="Tutup"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                  >
                    <XIcon className="size-4" />
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="p-4">
              <div className="max-h-80 overflow-auto border border-neutral-200 rounded">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>Belum ada mutasi</TableCell>
                      </TableRow>
                    ) : (
                      ledger.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell>{new Date(l.createdAt).toLocaleString("id-ID")}</TableCell>
                          <TableCell>{l.reason}</TableCell>
                          <TableCell className="text-right font-mono">{formatNumber(l.qty)}</TableCell>
                          <TableCell>{l.refType || "-"}</TableCell>
                          <TableCell>{l.note || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

function MutasiForm({ onSubmit }: { onSubmit: (payload: { direction: "IN" | "OUT"; qty: number; reason: string; note?: string | null }) => Promise<any> }) {
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("PRODUKSI");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const reasons = [
    "PRODUKSI",
    "PENJUALAN",
    "RETUR",
    "TRANSFER_IN",
    "TRANSFER_OUT",
    "WASTE",
    "PENYESUAIAN",
  ];
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await onSubmit({ direction, qty: Math.max(1, qty | 0), reason, note });
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex gap-2">
        <select
          className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm flex-1"
          value={direction}
          onChange={(e) => setDirection(e.target.value as any)}
        >
          <option value="IN">Masuk (+)</option>
          <option value="OUT">Keluar (-)</option>
        </select>
        <Input
          type="number"
          inputMode="numeric"
          className="w-24 font-mono"
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
          min={1}
        />
      </div>
      <div>
        <select
          className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Input placeholder="Catatan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="pt-1 text-right">
        <Button size="sm" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}

function TransferForm({
  currentBranchId,
  productId,
  onSubmit,
}: {
  currentBranchId: string;
  productId: string;
  onSubmit: (payload: { fromBranchId: string; toBranchId: string; items: { productId: string; qty: number }[] }) => Promise<any>;
}) {
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["branches", "all"],
    queryFn: async () => {
      const res = await fetch("/api/branches/all");
      if (!res.ok) throw new Error("Failed to load branches");
      return res.json();
    },
  });
  const [toBranchId, setToBranchId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const firstOther = branches.find((b) => b.id !== currentBranchId);
    if (firstOther) setToBranchId(firstOther.id);
  }, [branches, currentBranchId]);

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await onSubmit({ fromBranchId: currentBranchId, toBranchId, items: [{ productId, qty: Math.max(1, qty | 0) }] });
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="text-sm">Pilih tujuan dan jumlah:</div>
      <div className="flex gap-2">
        <select
          className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm flex-1"
          value={toBranchId}
          onChange={(e) => setToBranchId(e.target.value)}
        >
          {branches
            .filter((b) => b.id !== currentBranchId)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>
        <Input
          type="number"
          inputMode="numeric"
          className="w-24 font-mono"
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
          min={1}
        />
      </div>
      <div className="pt-1 text-right">
        <Button size="sm" disabled={loading || !toBranchId}>
          {loading ? "Memproses..." : "Transfer"}
        </Button>
      </div>
    </form>
  );
}
