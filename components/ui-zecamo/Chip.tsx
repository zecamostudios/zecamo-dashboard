"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
}

export function Chip({ children, active, className, ...rest }: ChipProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center gap-[6px] px-[11px] py-[6px] rounded-full text-xs border cursor-pointer transition-all duration-[140ms]",
        active
          ? "bg-[rgba(43,91,255,0.10)] border-[var(--color-primary)]/25 text-[var(--color-primary-hover)] shadow-[0_0_0_1px_rgba(43,91,255,0.25)]"
          : "bg-[var(--color-surface)] border-[var(--color-border-2)] text-[var(--color-text-muted)] hover:border-[var(--color-border-3)] hover:text-[var(--color-text)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
