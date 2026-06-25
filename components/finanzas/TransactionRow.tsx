import { Pencil } from "lucide-react";
import { Pill } from "@/components/ui-zecamo/Pill";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { fmtN } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

interface TransactionRowProps {
  tx: Transaction;
  format: (n: number) => string;
  onEdit?: (tx: Transaction) => void;
}

export function TransactionRow({ tx, format, onEdit }: TransactionRowProps) {
  const isIn = tx.type === "in";
  const editable = !!onEdit;
  // Subtexto: si se cargó en ARS, mostramos el monto original y la cotización usada
  const origLine =
    tx.moneda === "ARS" && tx.montoOriginal != null
      ? `ARS ${fmtN(tx.montoOriginal)}${tx.cotizacion ? ` @ ${fmtN(tx.cotizacion)}` : ""}`
      : null;

  return (
    <tr
      className={`border-b border-[var(--color-border)] last:border-b-0 group ${editable ? "cursor-pointer hover:bg-white/[0.02]" : ""}`}
      onClick={editable ? () => onEdit!(tx) : undefined}
    >
      <td className="py-[10px] font-mono text-[var(--color-text-muted)] text-[11.5px]">{tx.d}</td>
      <td className="py-[10px]">
        <div className="font-medium flex items-center gap-1.5">
          {tx.c}
          {editable && (
            <Pencil size={11} className="text-[var(--color-text-dim)] opacity-0 group-hover:opacity-100 transition" />
          )}
        </div>
      </td>
      <td className="py-[10px]">
        {tx.line === "Ops" ? (
          <span className="text-[11.5px] text-[var(--color-text-muted)]">—</span>
        ) : (
          <Pill variant={tx.line}>{tx.line}</Pill>
        )}
      </td>
      <td className="py-[10px]">
        <OwnerAvatar id={tx.owner} size="xs" />
      </td>
      <td className="py-[10px]">
        <div className="flex items-center gap-1.5">
          <Pill variant={isIn ? "active" : "paused"} dot>
            {isIn ? "Ingreso" : "Egreso"}
          </Pill>
          {!isIn && tx.claseEgreso && (
            <Pill variant={tx.claseEgreso === "fijo" ? "lead" : "seguim"}>
              {tx.claseEgreso === "fijo" ? "Fijo" : "Variable"}
            </Pill>
          )}
        </div>
      </td>
      <td
        className="py-[10px] text-right font-mono font-semibold"
        style={{ color: isIn ? "var(--color-success)" : "var(--color-text)" }}
      >
        <div>
          {isIn ? "+" : "−"}
          {format(tx.a)}
        </div>
        {origLine && (
          <div className="font-mono text-[10px] text-[var(--color-text-dim)] font-normal mt-0.5">{origLine}</div>
        )}
      </td>
    </tr>
  );
}
