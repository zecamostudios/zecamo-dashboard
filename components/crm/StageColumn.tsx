import { Plus } from "lucide-react";
import { Pill } from "@/components/ui-zecamo/Pill";
import { ProspectCard } from "./ProspectCard";
import { fmtUsd } from "@/lib/utils";
import type { Prospect, Stage } from "@/lib/types";

interface StageColumnProps {
  stage: Stage;
  prospects: Prospect[];
  compact?: boolean;
}

// TODO: usar @dnd-kit/core para drag-drop entre columnas en producción
export function StageColumn({ stage, prospects, compact }: StageColumnProps) {
  const total = prospects.reduce((s, p) => s + p.value, 0);

  return (
    <div className="bg-white/[0.015] border border-[var(--color-border)] rounded-2xl p-3 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Pill variant={stage.id} dot>{stage.label}</Pill>
          <span className="font-mono text-[11px] text-[var(--color-text-muted)]">{prospects.length}</span>
        </div>
        <button className="w-6 h-6 grid place-items-center bg-transparent border-0 text-[var(--color-text-muted)] cursor-pointer rounded">
          <Plus size={12} />
        </button>
      </div>
      {prospects.length > 0 && (
        <div className="font-mono text-[10.5px] text-[var(--color-text-dim)] mb-2 ml-1">{fmtUsd(total)} potencial</div>
      )}
      <div className="flex flex-col">
        {prospects.map((p) => (
          <ProspectCard key={p.id} prospect={p} />
        ))}
        {prospects.length === 0 && (
          <div
            className="text-center text-[12px] text-[var(--color-text-dim)] border border-dashed border-[var(--color-border-2)] rounded-lg"
            style={{ padding: compact ? "16px 12px" : "32px 12px" }}
          >
            Sin prospectos
          </div>
        )}
      </div>
    </div>
  );
}
