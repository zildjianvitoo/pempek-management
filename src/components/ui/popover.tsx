"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/src/lib/cn";

type PopoverCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
};

const Ctx = createContext<PopoverCtx | null>(null);

export function Popover({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const value = useMemo(() => ({ open, setOpen, triggerRef }), [open]);
  return (
    <Ctx.Provider value={value}>
      <div className={cn("relative inline-block", className)}>{children}</div>
    </Ctx.Provider>
  );
}

export function PopoverTrigger({
  asChild = false,
  children,
  className,
}: {
  asChild?: boolean;
  children: React.ReactElement | React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("PopoverTrigger must be used within Popover");
  const { open, setOpen, triggerRef } = ctx;

  const commonProps = {
    ref: triggerRef as any,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      setOpen(!open);
    },
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...commonProps,
      className: cn((children.props as any)?.className, className),
    });
  }

  return (
    <button type="button" className={className} {...commonProps}>
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  className,
  align = "start",
  sideOffset = 8,
  onOpenChange,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  onOpenChange?: (open: boolean) => void;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("PopoverContent must be used within Popover");
  const { open, setOpen, triggerRef } = ctx;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (contentRef.current?.contains(t)) return;
      if (triggerRef.current && triggerRef.current.contains(t as Node)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="false"
      style={{ marginTop: sideOffset }}
      className={cn(
        "absolute z-50 min-w-40 rounded-md border border-neutral-200 bg-white p-2 shadow-md focus:outline-none",
        align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

