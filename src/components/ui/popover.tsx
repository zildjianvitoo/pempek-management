"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; transform?: string }>({ top: 0, left: 0 });

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

  // Mount effect for portal target
  useEffect(() => setMounted(true), []);

  // Recalculate position when open changes or on resize/scroll
  useEffect(() => {
    function calc() {
      const el = triggerRef.current as HTMLElement | null;
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
      setPos({ top: r.bottom + sideOffset, left, transform });
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
      role="dialog"
      aria-modal="false"
      style={{ position: "fixed", top: pos.top, left: pos.left, transform: pos.transform }}
      className={cn(
        "z-[1000] min-w-40 rounded-md border border-neutral-200 bg-white p-2 shadow-md focus:outline-none",
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}
