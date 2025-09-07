"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/src/lib/cn";
import { createPortal } from "react-dom";

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
  align = "start",
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
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; transform?: string }>({ top: 0, left: 0 });

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

  useEffect(() => setMounted(true), []);

  // Positioning via portal (prevents clipping by overflow containers)
  useEffect(() => {
    function calc() {
      const el = triggerRef.current as HTMLElement | null;
      const content = contentRef.current as HTMLDivElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let left = r.left;
      let transform = "";
      if (align === "center") {
        left = r.left + r.width / 2;
        transform = "translateX(-50%)";
      } else if (align === "end") {
        left = r.right;
        transform = "translateX(-100%)";
      }
      let top = r.bottom + sideOffset;
      // clamp horizontally to viewport once we know content width
      requestAnimationFrame(() => {
        const cw = content?.getBoundingClientRect().width ?? 0;
        const maxLeft = window.innerWidth - cw - 8;
        const minLeft = 8;
        let computedLeft = left;
        if (!transform) computedLeft = Math.min(Math.max(minLeft, left), Math.max(minLeft, maxLeft));
        setPos({ top, left: computedLeft, transform });
      });
    }
    if (open) {
      calc();
      const ro = new ResizeObserver(calc);
      if (triggerRef.current) ro.observe(triggerRef.current);
      window.addEventListener("resize", calc);
      window.addEventListener("scroll", calc, true);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", calc);
        window.removeEventListener("scroll", calc, true);
      };
    }
  }, [open, align, sideOffset, triggerRef]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      style={{ position: "fixed", top: pos.top, left: pos.left, transform: pos.transform }}
      className={cn(
        "z-[1000] min-w-40 rounded-md border border-neutral-200 bg-white p-1 shadow-md focus:outline-none",
        className
      )}
    >
      {children}
    </div>,
    document.body
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
