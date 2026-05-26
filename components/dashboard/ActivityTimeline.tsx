import * as Icons from "lucide-react";
import { ACTIVITY } from "@/lib/mock-data";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { type LucideIcon } from "lucide-react";

const ICONS = Icons as unknown as Record<string, LucideIcon>;

export function ActivityTimeline() {
  // TODO: reemplazar por query a Supabase tabla `activity` (order by ts desc limit 10)
  return (
    <Card>
      <CardHead>
        <CardTitle big>Actividad</CardTitle>
      </CardHead>
      <div className="relative">
        {ACTIVITY.map((a, i, arr) => {
          const Ic = ICONS[a.ico] ?? Icons.Check;
          return (
            <div key={a.id} className="flex gap-3 pb-4 last:pb-0 relative">
              <div className="w-6 h-6 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-2)] grid place-items-center text-[var(--color-primary-hover)] shrink-0 relative z-10">
                <Ic size={12} />
                {i < arr.length - 1 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-4 bg-[var(--color-border-2)]" />
                )}
              </div>
              <div className="flex-1 flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-[13px] text-[var(--color-text)] leading-snug">{a.text}</div>
                  <div className="text-[11px] text-[var(--color-text-dim)] mt-0.5 font-mono">{a.when}</div>
                </div>
                <OwnerAvatar id={a.who} size="xs" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
