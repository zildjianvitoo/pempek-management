"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import DatePicker from "@/src/components/ui/date-picker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/src/components/ui/sheet";
import Link from "next/link";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  // Prefer DD-MM-YYYY display format going forward
  return `${day}-${m}-${y}`;
}

export default function Header() {
  const { data: session } = useSession();
  const [branch, setBranch] = useState("Pusat");
  const [date, setDate] = useState(todayStr());

  // Dummy branches; replace with server data later
  const branches = useMemo(() => [{ name: "Pusat" }, { name: "Cabang 1" }], []);

  useEffect(() => {
    try {
      const s = localStorage.getItem("pmk.header");
      if (s) {
        const { branch: b, date: dt } = JSON.parse(s);
        if (b) setBranch(b);
        if (dt) setDate(dt);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("pmk.header", JSON.stringify({ branch, date }));
    } catch {}
  }, [branch, date]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
        <div className="font-semibold text-primary md:flex">Pempek</div>
        <div className="mx-3 h-6 w-px bg-neutral-200 md:flex" />

        {/* Branch & date (desktop only) */}
        <div className="hidden md:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Pilih cabang"
                className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm hover:bg-neutral-50 inline-flex items-center gap-2"
              >
                <span className="font-medium">{branch}</span>
                <span aria-hidden>▾</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="mt-2">
              {branches.map((b) => (
                <DropdownMenuItem key={b.name} onSelect={() => setBranch(b.name)}>
                  <span className="flex-1 text-left">{b.name}</span>
                  {branch === b.name ? <span className="text-primary">✓</span> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DatePicker value={date} onChange={setDate} />
        </div>

        <div className="flex-1" />

        <div className="ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-300 px-3 text-sm hover:bg-neutral-50"
                aria-label="User menu"
              >
                <span className="size-6 rounded-full bg-neutral-200 grid place-items-center text-[10px] font-medium">
                  {session?.user?.name?.[0]?.toUpperCase() ||
                    session?.user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </span>
                <span className="hidden sm:inline max-w-[140px] truncate">
                  {session?.user?.name || session?.user?.email || "User"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2">
              <div className="px-2 py-1.5 text-xs text-neutral-500">{session?.user?.email}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Profil (segera)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  signOut({ callbackUrl: "/login" });
                }}
                className="text-red-600 hover:text-red-700"
              >
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Mobile menu trigger on the far right */}
        <div className="md:hidden ml-2">
          <Sheet>
            <SheetTrigger>
              <div className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 px-3 text-sm hover:bg-neutral-50">
                Menu
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 max-w-[90vw]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="p-3 space-y-4">
                <div>
                  <div className="mb-2 text-xs font-medium text-neutral-500">Cabang</div>
                  <DropdownMenu className="w-full">
                    <DropdownMenuTrigger asChild>
                      <div
                        aria-label="Pilih cabang"
                        className="w-full h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm hover:bg-neutral-50 inline-flex items-center justify-between"
                      >
                        <span className="font-medium">{branch}</span>
                        <span aria-hidden>▾</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="mt-2">
                      {branches.map((b) => (
                        <DropdownMenuItem key={b.name} onSelect={() => setBranch(b.name)}>
                          <span className="flex-1 text-left">{b.name}</span>
                          {branch === b.name ? <span className="text-primary">✓</span> : null}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="w-full">
                  <div className="mb-2 text-xs font-medium text-neutral-500">Tanggal</div>
                  <DatePicker value={date} onChange={setDate} className="w-full" />
                </div>
                {session?.user && (session.user as any).role === "OWNER" && (
                  <div className="pt-2">
                    <div className="mb-2 text-xs font-medium text-neutral-500">Navigasi</div>
                    <div className="flex flex-col gap-1">
                      <SheetClose asChild>
                        <Link
                          className="rounded-md px-3 py-2 hover:bg-neutral-50"
                          href="/master/branches"
                        >
                          Cabang
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          className="rounded-md px-3 py-2 hover:bg-neutral-50"
                          href="/master/products"
                        >
                          Produk
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          className="rounded-md px-3 py-2 hover:bg-neutral-50"
                          href="/master/prices"
                        >
                          Harga
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
