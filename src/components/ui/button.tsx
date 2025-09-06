"use client";

import * as React from "react";
import { cn } from "@/src/lib/cn";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "outline" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  variant?: Variant;
}

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900",
  outline:
    "bg-white text-neutral-900 hover:bg-neutral-50 border border-neutral-300",
  ghost:
    "bg-transparent text-neutral-900 hover:bg-neutral-50 border border-transparent",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "md", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          sizeClass[size],
          variantClass[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;

