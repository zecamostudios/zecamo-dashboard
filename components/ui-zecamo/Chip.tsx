"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
}

export function Chip({ children, active, className, type = "button", ...rest }: ChipProps) {
  // type="button" por defecto: un chip nunca manda un formulario. Sin esto, el
  // default del navegador es "submit" y dentro de un <form> guardaba de gedo.
  return (
    <button
      {...rest}
      type={type}
      className={cn(
        "inline-flex items-center gap-[6px] px-[11px] py-[6px] rounded-full text-xs border cursor-pointer transition-[background-color,border-color,color,box-shadow,transform] duration-[140ms] ease-out active:scale-[0.97]",
        active
          ? "bg-[rgba(43,91,255,0.10)] border-[var(--color-primary)]/25 text-[var(--color-primary-hover)] shadow-[0_0_0_1px_rgba(43,91,255,0.25)]"
          : "bg-[var(--color-surface)] border-[var(--color-border-2)] text-[var(--color-text-muted)] [@media(hover:hover)]:hover:border-[var(--color-border-3)] [@media(hover:hover)]:hover:text-[var(--color-text)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
