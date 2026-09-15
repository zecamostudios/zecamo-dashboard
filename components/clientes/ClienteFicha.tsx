"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Trash2, Folder, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, fmtN, fmtUsd } from "@/lib/utils";
import { emptyToNull } from "@/lib/forms/empty-to-null";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button, IconButton } from "@/components/ui-zecamo/Button";
import { Chip } from "@/components/ui-zecamo/Chip";
import { Pill } from "@/components/ui-zecamo/Pill";
import { FieldRow, FieldInput, FieldTextarea } from "@/components/ui-zecamo/Field";
import type { Cliente, Proyecto, Transaccion } from "@/types/database";

/**
 * Ficha de cliente: quien es, como lo contactas, cuanto paga y una nota.
 * Salieron de la interfaz el health score, el LTV proyectado, la linea de
 * servicio, el owner y la proxima accion — las columnas siguen en la base.
 *
 * Los dos recuadros de abajo (proyectos y transacciones) son de lectura y salen
 * de la base de verdad. La version anterior mostraba cuatro pagos inventados
 * calculados del MRR y una lista de proyectos que venia de datos mock.
 */

const ESTADOS = [
  { id: "activo", label: "Activo" },
  { id: "pausado", label: "Pausado" },
  { id: "churn", label: "Se fue" },
] as const;

/**
 * La base tiene DOS columnas de estado: `estado` (activo/pausado/churn), que
 * escribia la ficha, y `ui_status` (active/paused/...), que es la que leen la
 * tabla, los KPIs y la home. Escribir una sola dejaba el cambio invisible:
 * marcabas "Pausado" y la lista seguia mostrando Activo. Ahora se escriben las
 * dos, siempre por este mapa.
 */
const ESTADO_A_UI: Record<string, string> = {
  activo: "active",
  pausado: "paused",
  churn: "paused",
};

const fichaSchema = z.object({
  nombre: z.string().trim().min(1, "Poné el nombre de la empresa"),
  contacto_nombre: z.string().trim(),
  contacto_tel: z.string().trim(),
  contacto_email: z.union([z.literal(""), z.string().email("Ese email no es válido")]),
  // valueAsNumber en el register + un input vacio que llega como NaN y cae a 0.
  // (z.coerce.number() deja el tipo de entrada en unknown y rompe el resolver.)
  mrr_usd: z.number().min(0, "No puede ser negativo").or(z.nan().transform(() => 0)),
  estado: z.string(),
  notas: z.string(),
});

type FichaForm = z.infer<typeof fichaSchema>;

interface Props {
  cliente: Cliente | null;
  proyectos: Proyecto[];
  transacciones: Transaccion[];
}

export function ClienteFicha({ cliente, proyectos, transacciones }: Props) {
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
      nombre: cliente?.nombre ?? "",
      contacto_nombre: cliente?.contacto_nombre ?? "",
      contacto_tel: cliente?.contacto_tel ?? "",
      contacto_email: cliente?.contacto_email ?? "",
      mrr_usd: cliente?.mrr_usd ?? 0,
      estado: cliente?.estado ?? "activo",
      notas: cliente?.notas ?? "",
    },
  });

  const tel = watch("contacto_tel");
  const email = watch("contacto_email");
  const estadoActual = ESTADOS.find((e) => e.id === (cliente?.estado ?? "activo"));

  async function onSave(data: FichaForm) {
    setSaving(true);
    const payload = {
      nombre: data.nombre,
      contacto_nombre: emptyToNull(data.contacto_nombre),
      contacto_tel: emptyToNull(data.contacto_tel),
      contacto_email: emptyToNull(data.contacto_email),
      mrr_usd: data.mrr_usd,
      estado: data.estado,
      ui_status: ESTADO_A_UI[data.estado] ?? "active",
      notas: emptyToNull(data.notas),
    };

    if (cliente?.id) {
      const { error } = await supabase.from("clientes").update(payload).eq("id", cliente.id);
      if (error) toast.error("No se guardó: " + error.message);
      else {
        toast.success("Guardado");
        router.refresh();
      }
    } else {
      const { data: creado, error } = await supabase
        .from("clientes")
        .insert(payload)
        .select("id")
        .single();
      if (error) toast.error("No se guardó: " + error.message);
      else {
        toast.success("Cliente creado");
        if (creado) router.replace(`/clientes/${creado.id}`);
      }
    }
    setSaving(false);
  }

  function onInvalid() {
    const primero = Object.values(errors)[0]?.message;
    toast.error(primero ?? "Revisá los campos marcados");
  }

  async function onDelete() {
    if (!cliente?.id) return;
    if (!confirm(`¿Borrar "${cliente.nombre}"? No se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("clientes").delete().eq("id", cliente.id);
    if (error) {
      toast.error("No se pudo borrar: " + error.message);
      setDeleting(false);
      return;
    }
    toast.success("Cliente borrado");
    router.push("/clientes");
  }

  const subtitulo = cliente
    ? [
        `$${fmtN(cliente.mrr_usd)} por mes`,
        cliente.fecha_inicio ? `desde ${formatDate(`${cliente.fecha_inicio}T12:00:00`)}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Cargá el nombre y cuánto paga. El resto lo completás después.";

  return (
    <form onSubmit={handleSubmit(onSave, onInvalid)}>
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] [@media(hover:hover)]:hover:text-[var(--color-text-muted)] transition-colors duration-[140ms] ease-out"
      >
        <ArrowLeft size={12} />
        Clientes
      </Link>

      <PageHead
        title={cliente?.nombre || "Nuevo cliente"}
        subtitle={subtitulo}
        actions={
          <>
            {cliente && estadoActual && (
              <Pill variant={cliente.estado === "activo" ? "active" : "paused"} dot>
                {estadoActual.label}
              </Pill>
            )}
            {cliente?.id && (
              <IconButton
                type="button"
                onClick={onDelete}
                disabled={deleting}
                aria-label="Borrar cliente"
                title="Borrar cliente"
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
          <FieldRow label="Empresa" htmlFor="nombre" error={errors.nombre?.message}>
            <FieldInput
              id="nombre"
              autoComplete="organization"
              placeholder="Nombre del cliente"
              invalid={!!errors.nombre}
              {...register("nombre")}
            />
          </FieldRow>

          <FieldRow label="Contacto" htmlFor="contacto_nombre">
            <FieldInput
              id="contacto_nombre"
              autoComplete="name"
              placeholder="Con quién hablás"
              {...register("contacto_nombre")}
            />
          </FieldRow>

          <FieldRow
            label="Teléfono"
            htmlFor="contacto_tel"
            action={
              tel?.trim() ? (
                <a
                  href={`tel:${tel.replace(/\s/g, "")}`}
                  aria-label="Llamar"
                  title="Llamar"
                  className="size-[38px] shrink-0 grid place-items-center rounded-[10px] border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-[background-color,border-color,color,transform] duration-[140ms] ease-out active:scale-[0.97] [@media(hover:hover)]:hover:text-[var(--color-text)] [@media(hover:hover)]:hover:border-[var(--color-border-3)]"
                >
                  <Phone size={15} />
                </a>
              ) : undefined
            }
          >
            <FieldInput
              id="contacto_tel"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              mono
              placeholder="+54 9 381 ..."
              {...register("contacto_tel")}
            />
          </FieldRow>

          <FieldRow
            label="Email"
            htmlFor="contacto_email"
            error={errors.contacto_email?.message}
            action={
              email?.trim() && !errors.contacto_email ? (
                <a
                  href={`mailto:${email.trim()}`}
                  aria-label="Escribir un mail"
                  title="Escribir un mail"
                  className="size-[38px] shrink-0 grid place-items-center rounded-[10px] border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-[background-color,border-color,color,transform] duration-[140ms] ease-out active:scale-[0.97] [@media(hover:hover)]:hover:text-[var(--color-text)] [@media(hover:hover)]:hover:border-[var(--color-border-3)]"
                >
                  <Mail size={15} />
                </a>
              ) : undefined
            }
          >
            <FieldInput
              id="contacto_email"
              type="email"
              autoComplete="email"
              placeholder="nombre@empresa.com"
              invalid={!!errors.contacto_email}
              {...register("contacto_email")}
            />
          </FieldRow>

          <FieldRow
            label="Paga por mes"
            htmlFor="mrr_usd"
            hint="En dólares. Si es un trabajo de una sola vez, dejalo en 0."
            error={errors.mrr_usd?.message}
          >
            <FieldInput
              id="mrr_usd"
              type="number"
              min={0}
              step={50}
              mono
              invalid={!!errors.mrr_usd}
              {...register("mrr_usd", { valueAsNumber: true })}
            />
          </FieldRow>

          <FieldRow label="Estado" htmlFor="estado">
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2 py-1.5">
                  {ESTADOS.map((e) => (
                    <Chip key={e.id} active={field.value === e.id} onClick={() => field.onChange(e.id)}>
                      {e.label}
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
            <label htmlFor="notas" className="sr-only">
              Nota
            </label>
            <FieldTextarea
              id="notas"
              rows={8}
              className="min-h-[180px]"
              placeholder={"Qué le estamos haciendo, qué pidió, cómo sigue.\n\nEj: Le entregamos la web en agosto. Quiere sumar el bot de WhatsApp en octubre. Cobra por transferencia, factura a nombre de la SRL."}
              {...register("notas")}
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Guardando..." : cliente ? "Guardar" : "Crear cliente"}
          </Button>
          <span
            className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-dim)]"
            aria-live="polite"
          >
            {isDirty && !saving ? "sin guardar" : ""}
          </span>
        </div>

        {cliente && (proyectos.length > 0 || transacciones.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {proyectos.length > 0 && (
              <Card>
                <CardHead>
                  <CardTitle icon={<Folder size={12} />}>Proyectos</CardTitle>
                </CardHead>
                {proyectos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}`}
                    className="flex items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-b-0 text-[13px] [@media(hover:hover)]:hover:text-[var(--color-primary-hover)] transition-colors duration-[140ms] ease-out"
                  >
                    <span className="truncate">{p.nombre}</span>
                    <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-dim)] shrink-0">
                      {p.estado}
                    </span>
                  </Link>
                ))}
              </Card>
            )}

            {transacciones.length > 0 && (
              <Card>
                <CardHead>
                  <CardTitle icon={<Receipt size={12} />}>Últimos movimientos</CardTitle>
                </CardHead>
                {transacciones.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] truncate">{t.concepto || t.descripcion || t.categoria || "—"}</div>
                      <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-dim)]">
                        {formatDate(t.fecha)}
                      </div>
                    </div>
                    <span
                      className="font-[family-name:var(--font-mono)] text-[12.5px] shrink-0"
                      style={{
                        color: t.tipo === "ingreso" ? "var(--color-success)" : "var(--color-text-muted)",
                      }}
                    >
                      {t.tipo === "ingreso" ? "+" : "−"}
                      {fmtUsd(t.monto_usd)}
                    </span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
