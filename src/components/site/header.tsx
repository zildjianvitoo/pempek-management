"use client";

import { useEffect, useMemo, useState } from "react";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Header() {
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

  // Persist selection (optional lightweight UX)
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
        <div className="font-semibold text-neutral-900">Pempek</div>
        <div className="mx-3 h-6 w-px bg-neutral-200" />

        <label className="text-sm text-neutral-600 sr-only" htmlFor="branch">
          Cabang
        </label>
        <select
          id="branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          {branches.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>

        <div className="ml-2" />
        <label className="text-sm text-neutral-600 sr-only" htmlFor="date">
          Tanggal
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        />

        <div className="flex-1" />
        <button
          className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-300 px-3 text-sm hover:bg-neutral-50"
          aria-label="User menu"
        >
          <span className="size-6 rounded-full bg-neutral-200" />
          <span className="hidden sm:inline">User</span>
        </button>
      </div>
    </header>
  );
}
