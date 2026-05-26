import { Pill } from "@/components/ui-zecamo/Pill";
import { Progress } from "@/components/ui-zecamo/Progress";
import { fmtN } from "@/lib/utils";
import type { Client } from "@/lib/types";

interface ClientesTableProps {
  clients: Client[];
  onSelect: (c: Client) => void;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  onboarding: "Onboarding",
  paused: "Pausado",
};

const LINE_GRADIENT: Record<string, string> = {
  AIMA: "linear-gradient(135deg, var(--color-primary), rgba(0,0,0,0.4))",
  B2B: "linear-gradient(135deg, var(--color-purple), rgba(0,0,0,0.4))",
  Webs: "linear-gradient(135deg, var(--color-success), rgba(0,0,0,0.4))",
  "Diagnóstico": "linear-gradient(135deg, var(--color-warning), rgba(0,0,0,0.4))",
};

export function ClientesTable({ clients, onSelect }: ClientesTableProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left border-b border-[var(--color-border)]">
            {["Cliente", "Línea", "Estado", "MRR", "Proy.", "Health", "Cliente desde", "Próximo hito"].map((h, i) => (
              <th
                key={h}
                className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium px-[18px] py-3"
                style={{ textAlign: i === 3 ? "right" : "left" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c)}
              className="border-b border-[var(--color-border)] hover:bg-white/[0.02] cursor-pointer transition-colors"
            >
              <td className="px-[18px] py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full grid place-items-center font-semibold text-white text-[11.5px] shrink-0"
                    style={{ background: LINE_GRADIENT[c.line] ?? "var(--color-surface-2)" }}
                  >
                    {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11.5px] text-[var(--color-text-muted)]">{c.contact}</div>
                  </div>
                </div>
              </td>
              <td className="px-[18px] py-3"><Pill variant={c.line}>{c.line}</Pill></td>
              <td className="px-[18px] py-3"><Pill variant={c.status} dot>{STATUS_LABEL[c.status]}</Pill></td>
              <td className="px-[18px] py-3 text-right font-mono">${fmtN(c.mrr)}/mo</td>
              <td className="px-[18px] py-3 font-mono text-[var(--color-text-muted)]">{c.projects}</td>
              <td className="px-[18px] py-3 w-32">
                <div className="flex items-center gap-2">
                  <Progress
                    value={c.health}
                    className="flex-1"
                    variant={c.health > 80 ? "success" : c.health > 60 ? "warning" : "danger"}
                  />
                  <span className="font-mono text-[11.5px] text-[var(--color-text-muted)] w-6 text-right">{c.health}</span>
                </div>
              </td>
              <td className="px-[18px] py-3 font-mono text-[var(--color-text-muted)]">{c.since}</td>
              <td className="px-[18px] py-3 text-[var(--color-text-muted)] text-[12px]">{c.next}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
