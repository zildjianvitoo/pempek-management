"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/src/lib/cn";

type DialogCtx = { open: boolean; setOpen: (v: boolean) => void };
const Ctx = createContext<DialogCtx | null>(null);

export function Dialog({ children, open: controlled, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlled ?? uncontrolled;
  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolled(v));
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function DialogTrigger({ asChild = false, children }: { asChild?: boolean; children: React.ReactElement | React.ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DialogTrigger must be used within Dialog");
  const { open, setOpen } = ctx;
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(!open);
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (e: any) => {
        (children as any).props?.onClick?.(e);
        onClick(e);
      },
    });
  }
  return (
    <button onClick={onClick as any} type="button">
      {children}
    </button>
  );
}

export function DialogContent({ children, className, onOpenAutoFocus }: { children: React.ReactNode; className?: string; onOpenAutoFocus?: () => void }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DialogContent must be used within Dialog");
  const { open, setOpen } = ctx;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    onOpenAutoFocus?.();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen, onOpenAutoFocus]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1100]">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-xl outline-none",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-4 py-3 border-b border-neutral-200", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-sm font-semibold", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-4 py-3 border-t border-neutral-200 flex justify-end gap-2", className)}>{children}</div>;
}

export function DialogClose({ children, asChild = false }: { children: React.ReactElement | React.ReactNode; asChild?: boolean }) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DialogClose must be used within Dialog");
  const { setOpen } = ctx;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onClick: (e: any) => {
        (children as any).props?.onClick?.(e);
        setOpen(false);
      },
    });
  }
  return (
    <button type="button" onClick={() => setOpen(false)} className="inline-flex h-9 items-center rounded-md border border-neutral-300 px-3 text-sm">
      {children}
    </button>
  );
}

export default Dialog;

