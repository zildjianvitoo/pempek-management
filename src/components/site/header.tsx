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

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Header() {
  const { data: session } = useSession();
  const [branch, setBranch] = useState("PST");
  const [date, setDate] = useState(todayStr());

  // Dummy branches; replace with server data later
  const branches = useMemo(
    () => [
      { code: "PST", name: "Pusat" },
      { code: "CB1", name: "Cabang 1" },
    ],
    []
  );

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
        <div className="font-semibold text-primary hidden md:flex">Pempek</div>
        <div className="mx-3 h-6 w-px bg-neutral-200 hidden md:flex" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Pilih cabang"
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm hover:bg-neutral-50 inline-flex items-center gap-2"
            >
              <span className="font-medium">
                {branches.find((x) => x.code === branch)?.name || branch}
              </span>
              <span aria-hidden>▾</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="mt-2">
            {branches.map((b) => (
              <DropdownMenuItem key={b.code} onSelect={() => setBranch(b.code)}>
                <span className="flex-1 text-left">{b.name}</span>
                {branch === b.code ? <span className="text-primary">✓</span> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-2" />
        <label className="text-sm text-neutral-600 sr-only" htmlFor="date-picker">
          Tanggal
        </label>
        <DatePicker value={date} onChange={setDate} />

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
      </div>
    </header>
  );
}
