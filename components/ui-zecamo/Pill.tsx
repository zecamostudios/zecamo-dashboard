import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StageId, ClientStatus, ProjectStatus, ServiceLine } from "@/lib/types";

type PillVariant = StageId | ClientStatus | ProjectStatus | ServiceLine | string;

interface PillProps {
  children: ReactNode;
  variant?: PillVariant;
  dot?: boolean;
  className?: string;
}

const STAGE_STYLES: Record<string, string> = {
  lead:        "bg-[rgba(91,101,136,0.15)] text-[#B0B8D0]",
  discovery:   "bg-[rgba(43,91,255,0.10)] text-[var(--color-primary-hover)]",
  call1:       "bg-[rgba(45,212,212,0.14)] text-[var(--color-info)]",
  propuesta:   "bg-[rgba(164,123,255,0.14)] text-[var(--color-purple)]",
  call2:       "bg-[rgba(240,168,42,0.14)] text-[var(--color-warning)]",
  venta:       "bg-[rgba(34,197,139,0.14)] text-[var(--color-success)]",
  noresp:      "bg-white/[0.05] text-[var(--color-text-muted)]",
  noventa:     "bg-[rgba(255,84,102,0.14)] text-[var(--color-danger)]",
  seguim:      "bg-[rgba(106,115,146,0.18)] text-[#9BA4C3]",
  active:      "bg-[rgba(34,197,139,0.14)] text-[var(--color-success)]",
  paused:      "bg-[rgba(240,168,42,0.14)] text-[var(--color-warning)]",
  onboarding:  "bg-[rgba(43,91,255,0.10)] text-[var(--color-primary-hover)]",
  backlog:     "bg-white/[0.06] text-[var(--color-text-muted)]",
  curso:       "bg-[rgba(43,91,255,0.10)] text-[var(--color-primary-hover)]",
  review:      "bg-[rgba(240,168,42,0.14)] text-[var(--color-warning)]",
  entregado:   "bg-[rgba(34,197,139,0.14)] text-[var(--color-success)]",
  archivado:   "bg-white/[0.04] text-[var(--color-text-dim)]",
  AIMA:        "bg-[rgba(43,91,255,0.10)] text-[var(--color-primary-hover)]",
  B2B:         "bg-[rgba(164,123,255,0.14)] text-[var(--color-purple)]",
  Webs:        "bg-[rgba(34,197,139,0.14)] text-[var(--color-success)]",
  "Diagnóstico":"bg-[rgba(240,168,42,0.14)] text-[var(--color-warning)]",
};

export function Pill({ children, variant, dot, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap",
        variant && (STAGE_STYLES[variant] ?? "bg-white/[0.05] text-[var(--color-text-muted)]"),
        className,
      )}
    >
      {dot && <span className="w-[6px] h-[6px] rounded-full bg-current shadow-[0_0_6px_currentColor]" />}
      {children}
    </span>
  );
}
