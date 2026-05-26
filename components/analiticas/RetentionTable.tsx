import { Users } from "lucide-react";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import type { OwnerId } from "@/lib/types";

interface Row {
  id: OwnerId;
  name: string;
  short: string;
  total: number;
  won: number;
  lost: number;
  rate: number;
  value: number;
}

interface RetentionTableProps {
  rows: Row[];
}

export function RetentionTable({ rows }: RetentionTableProps) {
  return (
    <Card className="col-span-7 max-[1100px]:col-span-12">
      <CardHead>
        <CardTitle big icon={<Users size={16} />}>Cierre por owner</CardTitle>
      </CardHead>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="py-2 font-medium">Owner</th>
              <th className="py-2 font-medium">Total</th>
              <th className="py-2 font-medium">Cerrados</th>
              <th className="py-2 font-medium">Perdidos</th>
              <th className="py-2 font-medium">Tasa</th>
              <th className="py-2 font-medium text-right">Valor ganado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <OwnerAvatar id={o.id} />
                    <div>
                      <div className="font-medium">{o.name}</div>
                      <div className="text-[var(--color-text-muted)] text-[11.5px]">{o.short}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 font-mono">{o.total}</td>
                <td className="py-3 font-mono text-[var(--color-success)] font-semibold">{o.won}</td>
                <td className="py-3 font-mono text-[var(--color-text-muted)]">{o.lost}</td>
                <td className="py-3 w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 4 }}>
                      <div
                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]"
                        style={{ width: `${o.rate * 100}%` }}
                      />
                    </div>
                    <span
                      className="font-mono text-[11.5px] w-10 text-right font-semibold"
                      style={{ color: o.rate > 0.15 ? "var(--color-success)" : "var(--color-text)" }}
                    >
                      {Math.round(o.rate * 100)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right font-mono text-[var(--color-success)] font-semibold">
                  ${o.value.toLocaleString("en-US")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
