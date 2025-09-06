## Web App Manajemen Pempek – UMKM Multi-Cabang

Dokumen ini merangkum visi produk, arsitektur, rancangan halaman/komponen, skema data awal, serta TODO roadmap implementasi. Tech stack: Next.js (TypeScript) + SQLite + Tailwind CSS v4 + shadcn/ui. Gunakan semua library pada versi terbaru (latest). Integrasikan MCP context7 untuk tooling konteks pengembangan.

### Tujuan Produk

- Input kasir super cepat (POS responsif, dukungan keyboard, offline-first ringan/optimistic UI).
- Audit stok akurat berbasis kartu stok per cabang & alasan mutasi.
- Tutup harian terstruktur: rekap per metode bayar, pengeluaran, selisih kas, stok akhir.
- Laporan konsolidasi lintas cabang untuk owner.

### Pengguna & Peran

- Owner: semua cabang, laporan konsolidasi, kontrol harga/HPP.
- Kasir: POS, struk, retur.

### Halaman Utama (Pages)

1. Dashboard: KPI harian, penjualan per cabang, produk terlaris, stok menipis.
2. POS: grid produk, qty cepat, diskon, metode bayar (Cash/QRIS/Transfer), cetak/unduh struk.
3. Stok: saldo per cabang×produk, kartu stok/mutasi, transfer antar cabang.
4. Transaksi: riwayat penjualan, retur/void terstruktur.
5. Keuangan: pemasukan/pengeluaran, tutup harian, rekonsiliasi kas.
6. Master Data: cabang, produk/HPP/harga, pengguna & peran.
7. Laporan: penjualan, laba kotor, selisih stok; ekspor CSV/PDF.

### Komponen Kunci (Reusable)

- Header Global: switch `Cabang` + selector `Tanggal` (default: hari ini) + user menu.
- Kartu KPI: Penjualan, Laba Kotor, AOV, Item Terlaris, Stok Menipis.
- Tabel: sticky header; kolom umum: Produk, SKU, Saldo, Mutasi, HPP, Harga; filter/sort/search/pagination; dikelola dengan TanStack Table (React Table).
- Dialog: Mutasi Stok (Masuk/Keluar/Transfer + Alasan), Pembayaran (split tender), Tutup Harian.
- Form/Input: Input angka monospace, stepper +/−, keypad numeric.
- Toast/Notif: sukses, error, stok habis.
- Tabs, Badge, Modal, Button, Empty State, Confirm.

### Gaya Visual (Design System)

- Warna (CSS token):
  - `--primary: #0E7490` (teal, segar/ikan)
  - `--accent: #F59E0B` (amber, goreng/renyah)
  - `--neutral-900: #0F172A`, `--neutral-100: #F1F5F9`
  - `--success: #059669`, `--danger: #E11D48`
- Tipografi: Inter / SF Pro; H1 28–32, H2 22–24, body 14–16; angka monospace.
- Layout: Grid 12 kolom, spacing 8px scale, card radius 12–16, shadow lembut.
- Aksesibilitas: Kontras WCAG AA, hit area ≥ 44px, status jelas (ikon+warna+teks).

### Responsif & Tampilan Clean

- Breakpoints: gunakan default Tailwind (`sm:640`, `md:768`, `lg:1024`, `xl:1280`, `2xl:1536`). Mobile‑first, naikkan densitas secara bertahap.
- Container: `max-w-screen-lg` default; halaman data berat (tabel/laporan) bisa `xl/2xl` dengan padding `px-4 sm:px-6 lg:px-8`.
- Grid 12 kolom: mobile menumpuk, `md+` gunakan 12 kolom dengan gap 8–16. Hindari nested grid berlebihan.
- Tipografi fluida: gunakan `clamp()` untuk H1/H2; body 14–16. Angka memakai monospace.
- Dialog: mobile tampil sebagai sheet/fullscreen; desktop sebagai modal terpusat `max-w-md/lg`.
- Tabel (small screens): header sticky, scroll horizontal, kolom pertama sticky; sembunyikan kolom non‑kritis; sediakan tampilan kartu opsional.
- POS Product Grid: kolom `2/3/4/6/8` untuk `xs/sm/md/lg/xl`; pencarian tetap terlihat (sticky).
- Navigasi: header sticky, hormati `safe-area-inset` pada iOS; target sentuh ≥ 44px.
- Clean look: banyak whitespace, border `1px` netral, shadow lembut, maksimal 2 warna aksen, konsisten radius 12–16.
- Motion: halus dan singkat (`duration-150`), hormati `prefers-reduced-motion`.

### Interaksi Penting

- POS: tambah qty via +/− & keypad; quick-filter kategori (Lenjer, Kapal Selam, Kulit, Adaan, dlsb.).
- Mutasi stok: wajib alasan (Produksi, Penjualan, Retur, Transfer, Waste).
- Tutup harian: ringkasan total per metode bayar, pengeluaran, selisih kas, stok akhir.

### Arsitektur & Tech Stack

- Framework: Next.js (App Router) + TypeScript.
- DB: SQLite (via Prisma). File `app.db` (dev) dan migrasi Prisma.
- Auth & RBAC: NextAuth/Auth.js (Credentials) + middleware role guard (Owner/Kasir).
- State/UI: React Server Components + Client Components untuk POS; Zustand/Context untuk UI lokal (minim global state).
- Data Fetching/Cache: TanStack Query (React Query) untuk fetching, cache, optimistic UI, dan invalidation.
- Styling: Tailwind CSS v4 + CSS variables untuk token warna; shadcn/ui (berbasis Radix) untuk komponen aksesibel.
- Tabel & Ekspor: TanStack Table (React Table) headless + komponen shadcn/ui; util ekspor CSV; PDF via server route (pdfkit/puppeteer opsional di fase lanjut).
- Cetak Struk: Template HTML thermal + window.print() / ESC/P kompatibel (opsional lanjutan).
- MCP: context7 untuk integrasi Model Context Protocol (konteks-aware tooling/otomasi dev).

### Skema Data (draft v1 – Prisma)

- Branch(id, name, code, address, isActive)
- User(id, name, email, hash, role, branchId?)
- Product(id, name, sku, category, unit, isActive)
- Price(id, productId, branchId?, price, cost, effectiveAt)
- StockLedger(id, branchId, productId, qty, reason, refType, refId, note, createdAt)
  - reason enum: PRODUKSI | PENJUALAN | RETUR | TRANSFER_IN | TRANSFER_OUT | WASTE | PENYESUAIAN
- Transfer(id, fromBranchId, toBranchId, createdById, status, createdAt)
- TransferItem(id, transferId, productId, qty)
- Sale(id, branchId, cashierId, number, subtotal, discount, grandTotal, createdAt)
- SaleItem(id, saleId, productId, qty, price, cost, discount, lineTotal)
- Payment(id, saleId, method, amount)
  - method enum: CASH | QRIS | TRANSFER
- Expense(id, branchId, userId, category, amount, note, createdAt)
- DailyClose(id, branchId, date, openingCash, cashTotal, qrisTotal, transferTotal, expenseTotal, expectedCash, actualCash, diff, note, closedById, closedAt)

Catatan: saldo stok dihitung agregasi `StockLedger` (bukan kolom saldo), memastikan audit-able via kartu stok.

### Alur Kritis

- POS: pilih produk → tambah qty → diskon → pilih pembayaran (multi metode) → simpan → generate struk → buat `Sale`, `SaleItem`, `Payment`, dan `StockLedger` (reason= PENJUALAN −qty).
- Mutasi: Masuk/Keluar/Transfer → wajib alasan → buat baris `StockLedger` (+/−); transfer membuat 2 baris: OUT di sumber, IN di tujuan.
- Tutup Harian: agregasi `Payment` + `Expense` → hitung expected vs actual → simpan `DailyClose` → kunci edit transaksi (opsional by policy).

### Performa & Keandalan

- POS: pencarian instan (in-memory index), virtualized grid, shortcut keyboard, debounce minimal.
- Optimistic UI untuk POS & mutasi; kompensasi bila gagal.
- Soft-delete/disable untuk master data; history via ledger.

### Struktur Proyek (rencana)

- `src/app/(dashboard|pos|stok|transaksi|keuangan|master|laporan)`
- `src/components/ui/*` (Button, Input, Table, Modal, Toast, Tabs, Badge, KPI Card)
- `src/components/pos/*` (ProductGrid, Keypad, Cart, PaymentDialog)
- `src/lib/*` (auth, rbac, utils, csv, pdf)
- `src/server/*` (actions, services)
- `prisma/schema.prisma` (SQLite)

---

## TODO Roadmap Implementasi

### M1 – Bootstrap & Dasar

- [x] Inisialisasi Next.js (TS, App Router) + Tailwind v4 + komponen UI dasar gaya shadcn (Button, Input).
- [x] Setup TanStack Query (QueryClient Provider, hook dasar, boundary error/loading).
- [x] Setup util tabel dengan TanStack Table (definisi kolom, sorting, pagination, selection).
- [x] Setup Prisma + SQLite (`app.db`) + migrasi awal. Catatan: jalankan migrasi lokal via `bun run prisma:migrate` bila belum.
- [x] Konfigurasi lint/format (ESLint, Prettier) minimal.
- [x] Layout dasar + Header switch Cabang/Tanggal (dummy data awal).
<!-- - [ ] Integrasi MCP context7 (konfigurasi & dokumentasi singkat penggunaan di repo). -->

### M2 – Auth & RBAC

- [x] NextAuth/Credentials + hashing password (bcryptjs).
- [x] Middleware proteksi route + guard berbasis role.
- [x] Seed user awal (Owner, Kasir) dengan password terhash.

### M3 – Master Data

- [ ] CRUD Cabang.
- [ ] CRUD Produk (kategori, SKU, unit).
- [ ] Harga & HPP per cabang dengan `effectiveAt`.

### M4 – Stok & Mutasi

- [ ] Kartu stok: saldo agregasi per cabang×produk.
- [ ] Dialog Mutasi (Masuk/Keluar) + alasan wajib.
- [ ] Transfer antar cabang (OUT/IN twin-ledger) + status.

### M5 – POS

- [ ] Grid produk + kategori (quick filter) + pencarian.
- [ ] Keranjang: qty +/−, diskon per item & global.
- [ ] Dialog Pembayaran: multi-metode (Cash/QRIS/Transfer).
- [ ] Simpan transaksi: `Sale`, `SaleItem`, `Payment`, `StockLedger`.
- [ ] Struk: cetak/unduh.

### M6 – Keuangan & Tutup Harian

- [ ] Input pengeluaran (Expense) harian.
- [ ] Rekap metode bayar harian.
- [ ] Tutup Harian: hitung expected vs actual, simpan, lock.

### M7 – Transaksi & Retur

- [ ] Riwayat penjualan (filter/sort/search).
- [ ] Retur penjualan: item-level, buat ledger (+qty) dan penyesuaian pembayaran.

### M8 – Dashboard & Laporan

- [ ] Dashboard KPI harian + produk terlaris + stok menipis.
- [ ] Laporan penjualan, laba kotor, selisih stok.
- [ ] Ekspor CSV (server action) + PDF (opsional fase berikut).

### M9 – UX & Aksesibilitas

- [ ] Komponen UI aksesibel (focus ring, aria-\*).
- [ ] Toast/notif konsisten (sukses/error/stok habis).
- [ ] Keyboard shortcut POS lengkap.
- [ ] Audit responsif semua halaman (sm → 2xl).
- [ ] Konsistensi spacing/warna/border; densitas tabel bersih.
- [ ] Uji kontras & navigasi mobile (screen reader/keyboard).

### M10 – Kualitas & Deploy

- [ ] Seed data contoh & script reset DB.
- [ ] Test dasar (unit untuk utils, e2e ringan untuk flow POS).
- [ ] Build & profiling ringan; dokumentasi penggunaan.

---

### Definisi Sukses Fase Awal (MVP)

- Kasir dapat menyelesaikan transaksi < 10 detik dengan 5–10 item.
- Stok berkurang otomatis dari penjualan, bisa mutasi/transfer dan audit lewat kartu stok.
- Tutup harian menghasilkan rekap jelas per metode bayar + selisih kas.

### Catatan Implementasi

- Gunakan angka monospace untuk kolom numerik dan input qty/harga.
- Hindari kolom saldo tersinkron—selalu derivasi dari `StockLedger` agar audit-able.
- Jaga performa POS: gunakan memo/virtualisasi, minim re-render.
- Standarisasi styling via shadcn/ui + Tailwind v4; gunakan token warna di CSS variables.
  - Form handling: gunakan pola shadcn + React Hook Form + Zod.
    - Komponen: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` + `Input/Button`.
    - Validasi: schema `zod`, integrasi `zodResolver` (@hookform/resolvers).
    - Hindari state manual per-field jika bisa di-handle lewat RHF.
  - Tombol utama gunakan variant `primary` (`bg-primary text-primary-foreground`) dan ring fokus `ring-primary`.
- Prefer versi terbaru untuk seluruh dependency (Next.js, Prisma, NextAuth, Tailwind v4, shadcn/ui, dlsb.)(Jika breaking change minta permintaan user dulu untuk mengupdatenya atau tidak).
- Gunakan TanStack Query untuk fetching/caching, optimistic update POS & mutasi, dan invalidation per cabang/tanggal.
- Gunakan TanStack Table untuk semua tabel data; pertimbangkan server-side pagination/sorting untuk dataset besar.
- Terminal & Tooling: gunakan zsh sebagai shell default; package manager `bun` untuk dev scripts.
