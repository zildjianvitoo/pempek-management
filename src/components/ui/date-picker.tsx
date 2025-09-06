"use client";

import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import Calendar from "@/src/components/ui/calendar";
import { cn } from "@/src/lib/cn";

function toDateStrLocal(d: Date) {
  // Display as DD-MM-YYYY
  const day = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${day}-${m}-${y}`;
}

function parseDateStrLocal(s: string | undefined | null): Date | null {
  if (!s) return null;
  // Try DD-MM-YYYY
  let m = /^([0-9]{2})-([0-9]{2})-([0-9]{4})$/.exec(s);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const y = Number(m[3]);
    const date = new Date(y, mo, d);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  // Fallback to legacy YYYY-MM-DD
  m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(s);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const date = new Date(y, mo, d);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export default function DatePicker({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange?: (next: string) => void;
  className?: string;
}) {
  const selected = useMemo(() => parseDateStrLocal(value ?? ""), [value]);
  const [open, setOpen] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm shadow-sm",
            "hover:bg-neutral-50 inline-flex items-center gap-2",
            className
          )}
          aria-label="Pilih tanggal"
        >
          <span className="font-mono tabular-nums">
            {selected ? toDateStrLocal(selected) : "DD-MM-YYYY"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} onOpenChange={setOpen} className="max-w-[calc(100vw-1rem)]">
        <Calendar
          selected={selected ?? undefined}
          onSelect={(d) => {
            onChange?.(toDateStrLocal(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
