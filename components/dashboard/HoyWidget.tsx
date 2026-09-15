"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Flame, Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button } from "@/components/ui-zecamo/Button";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

/**
 * Lo que hay que hacer hoy: vencidas primero, despues las de hoy, despues las
 * que no tienen fecha. Las futuras no aparecen — para eso esta /tareas.
 *
 * El check ESCRIBE en la base. El widget viejo solo cambiaba el estado local:
 * marcabas una tarea, refrescabas y volvia.
 */

interface HoyWidgetProps {
  tasks?: Task[];
}

/** Hoy en horario local, comparable con `dueAt` (YYYY-MM-DD). */
function hoyISO(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function HoyWidget({ tasks }: HoyWidgetProps) {
  const supabase = createClient();
  const [items, setItems] = useState<Task[]>(tasks ?? []);
  const [guardando, setGuardando] = useState<string | null>(null);
  const hoy = hoyISO();

  const pendientes = items
    .filter((t) => !t.done)
    .filter((t) => !t.dueAt || t.dueAt <= hoy)
    .sort((a, b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999"));

  async function marcar(tarea: Task) {
    if (!tarea.dbId) return;
    setGuardando(tarea.dbId);
    // Optimista: el tilde tiene que sentirse instantaneo.
    setItems((prev) => prev.map((t) => (t.dbId === tarea.dbId ? { ...t, done: true } : t)));

    const { error } = await supabase
      .from("tareas")
      .update({ estado: "done", updated_at: new Date().toISOString() })
      .eq("id", tarea.dbId);

    if (error) {
      setItems((prev) => prev.map((t) => (t.dbId === tarea.dbId ? { ...t, done: false } : t)));
      toast.error("No se pudo marcar: " + error.message);
    }
    setGuardando(null);
  }

  return (
    <Card>
      <CardHead>
        <CardTitle big>
          Hoy
          <span className="ml-2 font-normal text-[12.5px] text-[var(--color-text-dim)] normal-case tracking-normal font-sans">
            {pendientes.length === 0
              ? "nada pendiente"
              : `${pendientes.length} ${pendientes.length === 1 ? "tarea" : "tareas"}`}
          </span>
        </CardTitle>
        <Link href="/tareas">
          <Button variant="ghost" className="text-xs">
            Ver todas
          </Button>
        </Link>
      </CardHead>

      {pendientes.length === 0 ? (
        <p className="py-6 text-[13px] text-[var(--color-text-muted)]">
          No queda nada para hoy. Si te acordás de algo, cargalo en Tareas.
        </p>
      ) : (
        pendientes.slice(0, 7).map((t) => {
          const vencida = !!t.dueAt && t.dueAt < hoy;
          return (
            <div
              key={t.dbId ?? t.id}
              className="flex items-start gap-2.5 py-2.5 border-b border-[var(--color-border)] last:border-b-0"
            >
              <button
                type="button"
                onClick={() => marcar(t)}
                disabled={guardando === t.dbId}
                aria-label={`Marcar "${t.text}" como hecha`}
                className="w-[20px] h-[20px] mt-0.5 rounded-md border border-[var(--color-border-3)] bg-transparent grid place-items-center cursor-pointer shrink-0 text-transparent transition-[background-color,border-color,transform] duration-[140ms] ease-out active:scale-[0.92] [@media(hover:hover)]:hover:border-[rgba(43,91,255,0.45)] [@media(hover:hover)]:hover:bg-[rgba(43,91,255,0.08)]"
              >
                <Check size={12} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] leading-snug text-[var(--color-text)]">{t.text}</div>
                <div className="flex items-center gap-1.5 mt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-muted)]">
                  <span className="truncate">{t.proj}</span>
                  <span className="opacity-40">·</span>
                  <span className={vencida ? "text-[var(--color-danger)]" : undefined}>
                    {vencida ? `vencida ${t.due}` : t.dueAt ? "hoy" : "sin fecha"}
                  </span>
                  {t.prio === "alta" && <Flame size={11} className="text-[var(--color-warning)]" />}
                </div>
              </div>
            </div>
          );
        })
      )}

      <Link href="/tareas" className="block mt-3">
        <Button className="w-full justify-center">
          <Plus size={13} />
          Agregar tarea
        </Button>
      </Link>
    </Card>
  );
}
