import { Pill } from "@/components/ui-zecamo/Pill";
import { fmtN } from "@/lib/utils";
import type { Client } from "@/lib/types";

/**
 * Cuatro columnas. Salieron "Línea", "Health" y "Próximo hito" (metricas que no
 * se cargaban desde ningun lado) y "Proy.", que siempre mostraba 1 porque el
 * conteo de proyectos nunca se consultaba.
 */

interface ClientesTableProps {
  clients: Client[];
  onSelect: (c: Client) => void;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  onboarding: "Onboarding",
  paused: "Pausado",
};

export function ClientesTable({ clients, onSelect }: ClientesTableProps) {
  if (clients.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 text-center text-[13px] text-[var(--color-text-muted)]">
        No hay clientes que coincidan.
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left border-b border-[var(--color-border)]">
            {["Cliente", "Estado", "Paga por mes", "Desde"].map((h, i) => (
              <th
                key={h}
                className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium px-[18px] py-3"
                style={{ textAlign: i === 2 ? "right" : "left" }}
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
              className="border-b border-[var(--color-border)] last:border-b-0 [@media(hover:hover)]:hover:bg-white/[0.02] cursor-pointer transition-colors duration-[140ms] ease-out"
            >
              <td className="px-[18px] py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full grid place-items-center font-semibold text-white text-[11.5px] shrink-0 bg-[var(--color-surface-2)] border border-[var(--color-border-2)]">
                    {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    {c.contact && (
                      <div className="text-[11.5px] text-[var(--color-text-muted)] truncate">{c.contact}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-[18px] py-3">
                <Pill variant={c.status} dot>{STATUS_LABEL[c.status] ?? c.status}</Pill>
              </td>
              <td className="px-[18px] py-3 text-right font-[family-name:var(--font-mono)]">
                {c.mrr > 0 ? `$${fmtN(c.mrr)}` : "—"}
              </td>
              <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[var(--color-text-muted)]">
                {c.since}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
