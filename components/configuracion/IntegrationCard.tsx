import { Pill } from "@/components/ui-zecamo/Pill";
import { Button } from "@/components/ui-zecamo/Button";
import type { Integration } from "./IntegracionesSection";

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration: it }: IntegrationCardProps) {
  const Ic = it.ico;
  const connected = it.status === "conectado";
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-white/[0.02] p-4 flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-[11px] grid place-items-center shrink-0"
        style={{ background: `${it.c}22`, border: `1px solid ${it.c}66`, color: it.c }}
      >
        <Ic size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-medium">{it.name}</span>
          <Pill variant={connected ? "active" : "backlog"} dot>
            {connected ? "Conectado" : "Desconectado"}
          </Pill>
        </div>
        <div className="text-[11.5px] text-[var(--color-text-muted)] mt-0.5 truncate">{it.d}</div>
      </div>
      <Button variant={connected ? "default" : "primary"} className="px-3 py-1.5">
        {connected ? "Gestionar" : "Conectar"}
      </Button>
    </div>
  );
}
