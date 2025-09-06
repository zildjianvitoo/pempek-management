"use client";

import { useMemo, useState } from "react";
import { cn } from "@/src/lib/cn";

function startOfDayLocal(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addMonths(d: Date, m: number) {
  return new Date(d.getFullYear(), d.getMonth() + m, 1);
}

function daysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

export interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  className?: string;
}

export default function Calendar({ selected, onSelect, className }: CalendarProps) {
  const today = startOfDayLocal(new Date());
  const [view, setView] = useState<Date>(selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1));
  const y = view.getFullYear();
  const m = view.getMonth();

  const firstDay = new Date(y, m, 1).getDay(); // 0=Sun..6=Sat
  const totalDays = daysInMonth(y, m);

  const weeks = useMemo(() => {
    const days: Array<{ date: Date; inMonth: boolean } | null> = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push({ date: new Date(y, m, d), inMonth: true });
    // pad to full weeks (multiples of 7)
    while (days.length % 7 !== 0) days.push(null);
    const rows: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [firstDay, totalDays, y, m]);

  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  return (
    <div className={cn("w-64 sm:w-72 select-none", className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-md border border-neutral-300 text-sm hover:bg-neutral-50"
          aria-label="Bulan sebelumnya"
          onClick={() => setView(addMonths(view, -1))}
        >
          ‹
        </button>
        <div className="text-sm font-medium">
          {view.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button
          type="button"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-md border border-neutral-300 text-sm hover:bg-neutral-50"
          aria-label="Bulan berikutnya"
          onClick={() => setView(addMonths(view, 1))}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs text-neutral-500 mb-1">
        {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-rows-6 gap-1">
        {weeks.map((row, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {row.map((cell, j) => {
              if (!cell) return <div key={j} className="h-9" />;
              const d = cell.date;
              const isToday = isSameDay(d, today);
              const isSelected = selected ? isSameDay(d, selected) : false;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => onSelect?.(d)}
                  className={cn(
                    "h-8 sm:h-9 rounded-md border text-[13px] sm:text-sm",
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : isToday
                      ? "border-neutral-300 bg-neutral-50"
                      : "border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
