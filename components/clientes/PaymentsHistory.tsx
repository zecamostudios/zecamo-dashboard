import { DollarSign } from "lucide-react";
import { Pill } from "@/components/ui-zecamo/Pill";
import { CardTitle } from "@/components/ui-zecamo/Card";
import { fmtN } from "@/lib/utils";

interface Payment {
  d: string;
  c: string;
  a: number;
  status: string;
}

interface PaymentsHistoryProps {
  payments: Payment[];
}

export function PaymentsHistory({ payments }: PaymentsHistoryProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <CardTitle big icon={<DollarSign size={14} />}>Historial de pagos</CardTitle>
      </div>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left">
            {["Fecha", "Concepto", "Monto", "Estado"].map((h, i) => (
              <th
                key={h}
                className="text-[10.5px] uppercase tracking-wider text-[var(--color-text-dim)] font-medium pb-3"
                style={{ textAlign: i === 2 ? "right" : "left" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={i} className="border-t border-[var(--color-border)]">
              <td className="py-3 font-mono text-[var(--color-text-muted)]">{p.d}</td>
              <td className="py-3">{p.c}</td>
              <td className="py-3 text-right font-mono text-[var(--color-success)] font-semibold">+${fmtN(p.a)}</td>
              <td className="py-3"><Pill variant="active" dot>{p.status}</Pill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
