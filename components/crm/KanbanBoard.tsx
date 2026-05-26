import { STAGES } from "@/lib/mock-data";
import { StageColumn } from "./StageColumn";
import type { Prospect } from "@/lib/types";

// TODO: usar @dnd-kit/core para drag-drop entre columnas en producción
export function KanbanBoard({ prospects }: { prospects: Prospect[] }) {
  const activeStages = STAGES.filter((s) => !["noresp", "noventa", "seguim"].includes(s.id));
  const closedStages = STAGES.filter((s) => ["noresp", "noventa", "seguim"].includes(s.id));

  return (
    <>
      <div className="grid grid-cols-6 gap-3.5 mb-[18px] overflow-x-auto pb-2 max-[1280px]:grid-cols-3 max-[640px]:grid-cols-1">
        {activeStages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            prospects={prospects.filter((p) => p.stage === stage.id)}
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
          />
        ))}
      </div>
    </>
  );
}
