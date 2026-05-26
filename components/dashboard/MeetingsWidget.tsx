import { MoreHorizontal, Video } from "lucide-react";
import { MEETINGS } from "@/lib/mock-data";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";

export function MeetingsWidget() {
  // TODO: reemplazar por query a Supabase tabla `meetings` (date >= today, limit 5)
  return (
    <Card>
      <CardHead>
        <CardTitle big>Próximas reuniones</CardTitle>
        <button className="w-7 h-7 grid place-items-center bg-transparent border-0 text-[var(--color-text-muted)] cursor-pointer rounded-md hover:bg-white/[0.04]">
          <MoreHorizontal size={13} />
        </button>
      </CardHead>
      {MEETINGS.map((m) => (
        <div key={m.id} className="flex items-stretch gap-3 py-3 border-b border-[var(--color-border)]">
          <div className="text-right w-12 shrink-0 font-mono text-[11px] text-[var(--color-text-muted)] leading-tight">
            <div className="text-[var(--color-text)] font-semibold mb-0.5 text-[12px]">{m.day}</div>
            <div>{m.time}</div>
          </div>
          <div className="w-[2px] bg-gradient-to-b from-[var(--color-primary)] to-[#1A3FCC] rounded-[2px] shadow-[0_0_6px_var(--color-glow)]" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[var(--color-text)] leading-snug">{m.title}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--color-text-muted)]">
              <Video size={11} />
              <span>{m.who}</span>
              <span className="opacity-40">·</span>
              <OwnerAvatar id={m.owner} size="xs" />
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}
