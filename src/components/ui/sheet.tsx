"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/src/lib/cn";

type SheetCtx = { open: boolean; setOpen: (v: boolean) => void };
const Ctx = createContext<SheetCtx | null>(null);

export function Sheet({ children, open: openProp, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = useCallback((v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setOpenState(v);
  }, [onOpenChange]);
  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function SheetTrigger({ asChild = false, children }: { asChild?: boolean; children: React.ReactElement | React.ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("SheetTrigger must be used within Sheet");
  const { open, setOpen } = ctx;
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(!open);
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { onClick: (e: any) => { (children as any).props?.onClick?.(e); onClick(e); } });
  }
  return <button onClick={onClick as any}>{children}</button>;
}

export function SheetContent({ children, side = "left", className }: { children: React.ReactNode; side?: "left" | "right"; className?: string }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("SheetContent must be used within Sheet");
  const { open, setOpen } = ctx;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div
        ref={contentRef}
        className={cn(
          "absolute top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl outline-none",
          side === "left" ? "left-0" : "right-0",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-b border-neutral-200 px-4 py-3", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-sm font-medium", className)}>{children}</div>;
}

export function SheetClose({ children, asChild = false }: { children: React.ReactElement | React.ReactNode; asChild?: boolean }) {
  const ctx = useContext(Ctx);
  const close = () => {
    if (!ctx) return; // no-op when not inside Sheet
    ctx.setOpen(false);
  };
  if (asChild && React.isValidElement(children))
    return React.cloneElement(children as any, {
      onClick: (e: React.MouseEvent) => {
        // Do NOT prevent default so <Link> navigates normally
        (children as any).props?.onClick?.(e);
        close();
      },
    });
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        close();
      }}
    >
      {children}
    </button>
  );
}

export default Sheet;
