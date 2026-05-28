"use client";

import { STAGES } from "@/lib/mock-data";
import { StageColumn } from "./StageColumn";
import type { Prospect, StageId } from "@/lib/types";

interface KanbanBoardProps {
  prospects: Prospect[];
  onMove?: (p: Prospect, dir: "prev" | "next") => void;
}

const ACTIVE_STAGE_IDS: StageId[] = ["lead", "discovery", "call1", "propuesta", "call2", "venta"];
const CLOSED_STAGE_IDS: StageId[] = ["noresp", "noventa", "seguim"];

export function KanbanBoard({ prospects, onMove }: KanbanBoardProps) {
  const activeStages = STAGES.filter((s) => ACTIVE_STAGE_IDS.includes(s.id as StageId));
  const closedStages = STAGES.filter((s) => CLOSED_STAGE_IDS.includes(s.id as StageId));

  return (
    <>
      <div className="grid grid-cols-6 gap-3.5 mb-[18px] overflow-x-auto pb-2 max-[1280px]:grid-cols-3 max-[640px]:grid-cols-1">
        {activeStages.map((stage, i) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            prospects={prospects.filter((p) => p.stage === stage.id)}
            canPrev={i > 0}
            canNext={i < activeStages.length - 1}
            onMove={onMove}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3.5 max-[640px]:grid-cols-1">
        {closedStages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            prospects={prospects.filter((p) => p.stage === stage.id)}
            compact
            onMove={onMove}
            canPrev
            canNext={false}
          />
        ))}
      </div>
    </>
  );
}
