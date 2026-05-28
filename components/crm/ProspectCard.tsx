"use client";

import Link from "next/link";
import { Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Pill } from "@/components/ui-zecamo/Pill";
import { fmtUsd } from "@/lib/utils";
import type { Prospect } from "@/lib/types";

interface ProspectCardProps {
  prospect: Prospect;
  onMove?: (p: Prospect, dir: "prev" | "next") => void;
  canPrev?: boolean;
  canNext?: boolean;
}

export function ProspectCard({ prospect: p, onMove, canPrev, canNext }: ProspectCardProps) {
  const href = p.dbId ? `/crm/${p.dbId}` : "/crm";

  return (
    <Link
      href={href}
      className="block bg-white/[0.02] border border-[var(--color-border)] rounded-xl p-3 mb-2 transition-all hover:bg-white/[0.04] hover:border-[rgba(43,91,255,0.25)] hover:shadow-[0_0_0_1px_rgba(43,91,255,0.25),0_4px_16px_rgba(43,91,255,0.18)]"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <OwnerAvatar id={p.owner} size="xs" />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium leading-tight truncate">{p.name}</div>
          <div className="text-[11px] text-[var(--color-text-muted)] truncate">{p.company}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <Pill variant={p.line}>{p.line}</Pill>
        <span className="font-mono text-[10.5px] text-[var(--color-text-dim)] ml-auto">{p.last}</span>
      </div>
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--color-border)]">
        <span className="font-mono text-[10.5px] text-[var(--color-text-muted)] inline-flex items-center gap-1">
          <Globe size={10} />{p.source}
        </span>
        <span className="font-mono text-[12px] font-semibold text-[var(--color-text)]">{fmtUsd(p.value)}</span>
      </div>
      {(canPrev || canNext) && onMove && (
        <div className="flex gap-1 justify-end mt-2 pt-1.5 border-t border-[var(--color-border)]" onClick={(e) => e.preventDefault()}>
          {canPrev && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMove(p, "prev"); }}
              className="p-0.5 bg-transparent border-0 text-[var(--color-text-dim)] cursor-pointer hover:text-[var(--color-text)]"
              title="Etapa anterior"
            >
              <ChevronLeft size={11} />
            </button>
          )}
          {canNext && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMove(p, "next"); }}
              className="p-0.5 bg-transparent border-0 text-[var(--color-primary-hover)] cursor-pointer"
              title="Siguiente etapa"
            >
              <ChevronRight size={11} />
            </button>
          )}
        </div>
      )}
    </Link>
  );
}
