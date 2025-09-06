"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/src/lib/cn";

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
};

const DropdownCtx = createContext<Ctx | null>(null);

export function DropdownMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const value = useMemo(() => ({ open, setOpen, triggerRef }), [open]);
  return (
    <DropdownCtx.Provider value={value}>
      <div className={cn("relative inline-block text-left", className)}>{children}</div>
    </DropdownCtx.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild = false,
  children,
  className,
}: {
  asChild?: boolean;
  children: React.ReactElement | React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(DropdownCtx);
  if (!ctx) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
  const { open, setOpen, triggerRef } = ctx;

  const commonProps = {
    ref: triggerRef as any,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      setOpen(!open);
    },
    "aria-haspopup": "menu" as const,
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

export function DropdownMenuContent({
  children,
  className,
  align = "end",
  sideOffset = 8,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  const ctx = useContext(DropdownCtx);
  if (!ctx) throw new Error("DropdownMenuContent must be used within DropdownMenu");
  const { open, setOpen, triggerRef } = ctx;
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on outside click / escape
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
      role="menu"
      style={{ marginTop: sideOffset }}
      className={cn(
        "absolute z-50 min-w-40 rounded-md border border-neutral-200 bg-white p-1 shadow-md focus:outline-none",
        align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onSelect,
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  onSelect?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}) {
  const ctx = useContext(DropdownCtx);
  if (!ctx) throw new Error("DropdownMenuItem must be used within DropdownMenu");
  const { setOpen } = ctx;
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onSelect?.(e);
        setOpen(false);
      }}
      className={cn(
        "flex w-full select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-neutral-800",
        "hover:bg-neutral-50 focus:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px w-full bg-neutral-200" role="separator" />;
}
