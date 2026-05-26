"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

export function Button({ children, variant = "default", className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center gap-[7px] px-[14px] py-[8px] text-[13px] font-medium rounded-[10px] border transition-all duration-[140ms] cursor-pointer",
        variant === "default" &&
          "bg-[var(--color-surface)] border-[var(--color-border-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-3)] hover:shadow-[0_0_0_1px_rgba(43,91,255,0.25),0_0_14px_rgba(43,91,255,0.15)]",
        variant === "primary" &&
          "bg-gradient-to-b from-[var(--color-primary-hover)] to-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(43,91,255,0.35),0_0_0_1px_var(--color-primary)] hover:from-[#5483FF] hover:to-[var(--color-primary-hover)]",
        variant === "ghost" &&
          "bg-transparent border-transparent text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: number;
  ping?: boolean;
}

export function IconButton({ children, size = 36, ping, className, ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      style={{ width: size, height: size }}
      className={cn(
        "rounded-[10px] border border-[var(--color-border-2)] bg-[var(--color-surface)] grid place-items-center cursor-pointer text-[var(--color-text-muted)] relative transition-all duration-[140ms]",
        "hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-3)] hover:text-[var(--color-text)] hover:shadow-[0_0_0_1px_rgba(43,91,255,0.25),0_0_12px_rgba(43,91,255,0.15)]",
        className,
      )}
    >
      {children}
      {ping && (
        <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[var(--color-primary-hover)] rounded-full border-2 border-[var(--color-surface)] shadow-[0_0_8px_var(--color-glow)]" />
      )}
    </button>
  );
}
