"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/cn";
import { SheetClose } from "@/src/components/ui/sheet";

const items = [
  {
    section: "Operasional",
    links: [{ href: "/stok", label: "Stok" }],
  },
  {
    section: "Master Data",
    links: [
      { href: "/master/branches", label: "Cabang" },
      { href: "/master/products", label: "Produk" },
      { href: "/master/prices", label: "Harga" },
    ],
  },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="text-sm">
      {items.map((sec) => (
        <div key={sec.section} className="mb-4">
          <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {sec.section}
          </div>
          <div className="flex flex-col gap-1">
            {sec.links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <SheetClose asChild key={l.label}>
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={onNavigate}
                    className={cn(
                      "rounded-md px-3 py-2 hover:bg-neutral-50",
                      active ? "bg-neutral-100 text-primary font-medium" : "text-neutral-800"
                    )}
                  >
                    {l.label}
                  </Link>
                </SheetClose>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
