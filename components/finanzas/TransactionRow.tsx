import { Pill } from "@/components/ui-zecamo/Pill";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import type { Transaction } from "@/lib/types";

interface TransactionRowProps {
  tx: Transaction;
  format: (n: number) => string;
}

export function TransactionRow({ tx, format }: TransactionRowProps) {
  const isIn = tx.type === "in";
  return (
    <tr className="border-b border-[var(--color-border)] last:border-b-0">
      <td className="py-[10px] font-mono text-[var(--color-text-muted)] text-[11.5px]">{tx.d}</td>
      <td className="py-[10px]">
        <div className="font-medium">{tx.c}</div>
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
        <Pill variant={isIn ? "active" : "paused"} dot>
          {isIn ? "Ingreso" : "Egreso"}
        </Pill>
      </td>
      <td
        className="py-[10px] text-right font-mono font-semibold"
        style={{ color: isIn ? "var(--color-success)" : "var(--color-text)" }}
      >
        {isIn ? "+" : "−"}
        {format(tx.a)}
      </td>
    </tr>
  );
}
