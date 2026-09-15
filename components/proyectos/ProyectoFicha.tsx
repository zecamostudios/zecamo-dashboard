"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { emptyToNull } from "@/lib/forms/empty-to-null";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_ORDER, STATUS_A_UI_ESTADO } from "@/lib/proyectos/estados";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button, IconButton } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import { Pill } from "@/components/ui-zecamo/Pill";
import { FieldRow, FieldInput, FieldTextarea } from "@/components/ui-zecamo/Field";
import type { ProjectStatus } from "@/lib/types";
import type { Proyecto, Tarea } from "@/types/database";

/**
 * Ficha de proyecto: nombre, de quien es, cuando se entrega, en que estado esta
 * y una nota. Salieron de la interfaz la linea de servicio, el owner, la
 * prioridad, el progreso en %, el precio y las horas — las columnas quedan.
 *
 * El estado se guarda en `estado` Y en `ui_estado` (ver STATUS_A_UI_ESTADO):
 * habia dos columnas con vocabularios distintos y el kanban leia justo la que
 * nadie escribia, asi que los proyectos no se movian nunca de la primera columna.
 */

const fichaSchema = z.object({
  nombre: z.string().trim().min(1, "Poné el nombre del proyecto"),
  // cliente_id es NOT NULL en la base: un proyecto siempre es de alguien.
  cliente_id: z.string().min(1, "Elegí de qué cliente es"),
  fecha_entrega: z.string(),
  estado: z.string(),
  descripcion: z.string(),
});

type FichaForm = z.infer<typeof fichaSchema>;

const SELECT_CLASS =
  "w-full min-h-[44px] px-3 -mx-3 text-[15px] bg-transparent text-[var(--color-text)] rounded-[10px] border border-transparent outline-none cursor-pointer transition-[background-color,border-color,box-shadow] duration-[140ms] ease-out [@media(hover:hover)]:hover:bg-white/[0.02] [@media(hover:hover)]:hover:border-[var(--color-border-2)] focus:bg-white/[0.03] focus:border-[rgba(43,91,255,0.45)] focus:shadow-[0_0_0_3px_rgba(43,91,255,0.15)]";

interface Props {
  proyecto: Proyecto | null;
  clientes: { id: string; nombre: string }[];
  tareas: Tarea[];
}

export function ProyectoFicha({ proyecto, clientes, tareas }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<FichaForm>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      nombre: proyecto?.nombre ?? "",
      cliente_id: proyecto?.cliente_id ?? "",
      fecha_entrega: proyecto?.fecha_entrega ?? "",
      estado: proyecto?.estado ?? "propuesta",
      descripcion: proyecto?.descripcion ?? "",
    },
  });

  const estadoElegido = watch("estado") as ProjectStatus;
  const clienteActual = clientes.find((c) => c.id === proyecto?.cliente_id);
  const pendientes = tareas.filter((t) => t.estado !== "done");

  async function onSave(data: FichaForm) {
    setSaving(true);
    const estado = data.estado as ProjectStatus;
    const payload = {
      nombre: data.nombre,
      cliente_id: data.cliente_id,
      fecha_entrega: emptyToNull(data.fecha_entrega),
      estado,
      ui_estado: STATUS_A_UI_ESTADO[estado] ?? "backlog",
      descripcion: emptyToNull(data.descripcion),
    };

    if (proyecto?.id) {
      const { error } = await supabase
        .from("proyectos")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", proyecto.id);
      if (error) toast.error("No se guardó: " + error.message);
      else {
        toast.success("Guardado");
        router.refresh();
      }
    } else {
      const { data: creado, error } = await supabase
        .from("proyectos")
        .insert(payload)
        .select("id")
        .single();
      if (error) toast.error("No se guardó: " + error.message);
      else {
        toast.success("Proyecto creado");
        if (creado) router.replace(`/proyectos/${creado.id}`);
      }
    }
    setSaving(false);
  }

  function onInvalid() {
    const primero = Object.values(errors)[0]?.message;
    toast.error(primero ?? "Revisá los campos marcados");
  }

  async function onDelete() {
    if (!proyecto?.id) return;
    if (!confirm(`¿Borrar "${proyecto.nombre}"? No se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("proyectos").delete().eq("id", proyecto.id);
    if (error) {
      toast.error("No se pudo borrar: " + error.message);
      setDeleting(false);
      return;
    }
    toast.success("Proyecto borrado");
    router.push("/proyectos");
  }

  const subtitulo = proyecto
    ? [
        clienteActual?.nombre,
        proyecto.fecha_entrega
          ? `entrega ${formatDate(`${proyecto.fecha_entrega}T12:00:00`)}`
          : "sin fecha de entrega",
      ]
        .filter(Boolean)
        .join(" · ")
    : "Nombre y cliente, y listo. El resto lo completás sobre la marcha.";

  return (
    <form onSubmit={handleSubmit(onSave, onInvalid)}>
      <Link
        href="/proyectos"
        className="inline-flex items-center gap-1.5 mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] [@media(hover:hover)]:hover:text-[var(--color-text-muted)] transition-colors duration-[140ms] ease-out"
      >
        <ArrowLeft size={12} />
        Proyectos
      </Link>

      <PageHead
        title={proyecto?.nombre || "Nuevo proyecto"}
        subtitle={subtitulo}
        actions={
          <>
            {proyecto && (
              <Pill variant={estadoElegido} dot>
                {PROJECT_STATUS_LABELS[estadoElegido] ?? estadoElegido}
              </Pill>
            )}
            {proyecto?.id && (
              <IconButton
                type="button"
                onClick={onDelete}
                disabled={deleting}
                aria-label="Borrar proyecto"
                title="Borrar proyecto"
                className="text-[var(--color-text-dim)] [@media(hover:hover)]:hover:text-[var(--color-danger)] [@media(hover:hover)]:hover:border-[rgba(255,84,102,0.35)] [@media(hover:hover)]:hover:shadow-none"
              >
                <Trash2 size={15} />
              </IconButton>
            )}
          </>
        }
      />

      <div className="max-w-[720px] space-y-4">
        <Card>
          <FieldRow label="Proyecto" htmlFor="nombre" error={errors.nombre?.message}>
            <FieldInput
              id="nombre"
              placeholder="Ej: Web + reservas"
              invalid={!!errors.nombre}
              {...register("nombre")}
            />
          </FieldRow>

          <FieldRow label="Cliente" htmlFor="cliente_id" error={errors.cliente_id?.message}>
            <select id="cliente_id" {...register("cliente_id")} className={SELECT_CLASS}>
              <option value="">Elegí un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Entrega" htmlFor="fecha_entrega" hint="Cuándo lo tenés que entregar.">
            <FieldInput id="fecha_entrega" type="date" mono {...register("fecha_entrega")} />
          </FieldRow>

          <FieldRow label="Estado" htmlFor="estado">
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2 py-1.5 flex-wrap">
                  {PROJECT_STATUS_ORDER.map((s) => (
                    <Chip key={s} active={field.value === s} onClick={() => field.onChange(s)}>
                      {PROJECT_STATUS_LABELS[s]}
                    </Chip>
                  ))}
                </div>
              )}
            />
          </FieldRow>
        </Card>

        <Card>
          <CardTitle>Nota</CardTitle>
          <div className="mt-3">
            <label htmlFor="descripcion" className="sr-only">
              Nota
            </label>
            <FieldTextarea
              id="descripcion"
              rows={8}
              className="min-h-[180px]"
              placeholder={"Qué incluye, qué falta, qué quedó pendiente de decidir.\n\nEj: Web de 5 secciones + formulario. Falta que manden las fotos del salón. El dominio lo compran ellos."}
              {...register("descripcion")}
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Guardando..." : proyecto ? "Guardar" : "Crear proyecto"}
          </Button>
          <span
            className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-dim)]"
            aria-live="polite"
          >
            {isDirty && !saving ? "sin guardar" : ""}
          </span>
        </div>

        {proyecto && tareas.length > 0 && (
          <Card>
            <CardHead>
              <CardTitle icon={<CheckSquare size={12} />}>
                Tareas · {pendientes.length} pendientes de {tareas.length}
              </CardTitle>
              <Link href="/tareas">
                <Button variant="ghost" className="text-xs">
                  Ver tareas
                </Button>
              </Link>
            </CardHead>
            {tareas.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-b-0"
              >
                <span
                  className={
                    t.estado === "done"
                      ? "text-[13px] line-through text-[var(--color-text-dim)] truncate"
                      : "text-[13px] truncate"
                  }
                >
                  {t.titulo}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-dim)] shrink-0">
                  {t.fecha_limite ? formatDate(`${t.fecha_limite}T12:00:00`) : "sin fecha"}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </form>
  );
}
