import { Video } from "lucide-react";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import type { Meeting } from "@/lib/types";

/**
 * Sin fallback a MEETINGS (los datos de mentira): si no hay reuniones, lo dice.
 * Un widget que inventa datos es peor que un widget vacio.
 */

interface MeetingsWidgetProps {
  meetings?: Meeting[];
}

export function MeetingsWidget({ meetings }: MeetingsWidgetProps) {
  const proximas = (meetings ?? []).slice(0, 3);

  return (
    <Card>
      <CardHead>
        <CardTitle big>
          Próximas reuniones
          {proximas.length > 0 && (
            <span className="ml-2 font-normal text-[12.5px] text-[var(--color-text-dim)] normal-case tracking-normal font-sans">
              {proximas.length}
            </span>
          )}
        </CardTitle>
      </CardHead>

      {proximas.length === 0 ? (
        <p className="py-6 text-[13px] text-[var(--color-text-muted)]">No hay reuniones agendadas.</p>
      ) : (
        proximas.map((m) => (
          <div
            key={m.id}
            className="flex items-stretch gap-3 py-3 border-b border-[var(--color-border)] last:border-b-0"
          >
            <div className="text-right w-12 shrink-0 font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-muted)] leading-tight">
              <div className="text-[var(--color-text)] font-semibold mb-0.5 text-[12px]">{m.day}</div>
              <div>{m.time}</div>
            </div>
            <div className="w-[2px] bg-gradient-to-b from-[var(--color-primary)] to-[#1A3FCC] rounded-[2px] shadow-[0_0_6px_var(--color-glow)]" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[var(--color-text)] leading-snug">{m.title}</div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--color-text-muted)]">
                <Video size={11} />
                <span className="truncate">{m.who}</span>
                <span className="opacity-40">·</span>
                <OwnerAvatar id={m.owner} size="xs" />
              </div>
            </div>
          </div>
        ))
      )}
    </Card>
  );
}
