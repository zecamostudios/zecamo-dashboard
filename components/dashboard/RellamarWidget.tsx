"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button } from "@/components/ui-zecamo/Button";
import type { Prospect } from "@/lib/types";

/**
 * Prospectos con algo escrito en "volver a llamar". Es la lista de llamados
 * pendientes, con el boton para llamar al lado: la home no deberia obligarte a
 * entrar a la ficha para marcar un numero.
 */

interface RellamarWidgetProps {
  prospects?: Prospect[];
}

export function RellamarWidget({ prospects }: RellamarWidgetProps) {
  const pendientes = (prospects ?? []).filter((p) => p.recall);

  return (
    <Card>
      <CardHead>
        <CardTitle big>
          A rellamar
          <span className="ml-2 font-normal text-[12.5px] text-[var(--color-text-dim)] normal-case tracking-normal font-sans">
            {pendientes.length === 0 ? "nadie pendiente" : `${pendientes.length} pendientes`}
          </span>
        </CardTitle>
        <Link href="/crm">
          <Button variant="ghost" className="text-xs">
            Ver CRM
          </Button>
        </Link>
      </CardHead>

      {pendientes.length === 0 ? (
        <p className="py-6 text-[13px] text-[var(--color-text-muted)]">
          Nadie esperando un llamado. Cuando anotes &ldquo;volver a llamar&rdquo; en una ficha, aparece acá.
        </p>
      ) : (
        pendientes.slice(0, 6).map((p) => (
          <div
            key={p.dbId ?? p.id}
            className="flex items-center gap-2.5 py-2.5 border-b border-[var(--color-border)] last:border-b-0"
          >
            <Link href={p.dbId ? `/crm/${p.dbId}` : "/crm"} className="flex-1 min-w-0 group">
              <div className="text-[13.5px] font-medium text-[var(--color-text)] truncate">
                {p.company || p.name}
              </div>
              <div className="text-[11.5px] text-[var(--color-text-muted)] truncate">
                {p.recallText ?? "sin detalle"}
              </div>
            </Link>
            {p.phone && (
              <a
                href={`tel:${p.phone.replace(/\s/g, "")}`}
                aria-label={`Llamar a ${p.company || p.name}`}
                title="Llamar"
                className="size-[34px] shrink-0 grid place-items-center rounded-[10px] border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-[background-color,border-color,color,transform] duration-[140ms] ease-out active:scale-[0.97] [@media(hover:hover)]:hover:text-[var(--color-text)] [@media(hover:hover)]:hover:border-[var(--color-border-3)]"
              >
                <Phone size={14} />
              </a>
            )}
          </div>
        ))
      )}
    </Card>
  );
}
