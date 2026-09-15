"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MessageCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { emptyToNull } from "@/lib/forms/empty-to-null";
import { STAGES } from "@/lib/mock-data";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Card, CardTitle } from "@/components/ui-zecamo/Card";
import { Button, IconButton } from "@/components/ui-zecamo/Button";
import { Pill } from "@/components/ui-zecamo/Pill";
import { FieldRow, FieldInput, FieldTextarea } from "@/components/ui-zecamo/Field";
import type { Prospecto } from "@/types/database";

/**
 * La ficha tiene cinco campos y nada mas: empresa, nombre, telefono, fecha de
 * contacto y nota. El resto de las columnas (email, fuente, valor estimado,
 * notas_llamadas, asignado_a...) siguen existiendo en la base y las sigue
 * escribiendo n8n — solo no se muestran ni se tocan desde aca. El update manda
 * unicamente estos cinco campos, asi que lo que no se ve no se pisa.
 *
 * La etapa no se edita aca: se mueve desde las flechas de la tarjeta en el
 * kanban, que es donde Joaco ya la mueve.
 */

const fichaSchema = z
  .object({
    negocio: z.string().trim(),
    nombre_dueno: z.string().trim(),
    telefono: z.string().trim(),
    fecha_contacto: z.string(),
    notas: z.string(),
  })
  // `negocio` es NOT NULL en la base. Pedimos empresa o nombre — con uno alcanza,
  // y si no pusiste empresa se guarda el nombre ahi para no fallar con un 23502.
  .refine((d) => d.negocio.length > 0 || d.nombre_dueno.length > 0, {
    message: "Poné al menos la empresa o el nombre",
    path: ["negocio"],
  });

type FichaForm = z.infer<typeof fichaSchema>;

/** Fecha de hoy en horario local, en el formato que espera <input type="date">. */
function hoyLocal(): string {
  return new Date().toLocaleDateString("en-CA");
}

/**
 * Link de WhatsApp. Un numero escrito con + se respeta tal cual; si no, se
 * asume Argentina (54 9). Ojo: el "15" no se puede sacar sin saber cuantos
 * digitos tiene el codigo de area, asi que si el numero lo trae, queda.
 */
function waLink(tel: string): string | null {
  const raw = tel.trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (raw.startsWith("+")) return `https://wa.me/${digits}`;
  const local = digits.replace(/^54/, "").replace(/^0/, "").replace(/^9/, "");
  return `https://wa.me/549${local}`;
}

/** "hace 3 días" a partir de una fecha sin hora. */
function haceCuanto(fecha: string): string | null {
  const t = new Date(`${fecha}T12:00:00`).getTime();
  if (Number.isNaN(t)) return null;
  const dias = Math.round((Date.now() - t) / 86_400_000);
  if (dias < 0) return "agendado";
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 31) return `hace ${dias} días`;
  const meses = Math.round(dias / 30);
  return meses === 1 ? "hace un mes" : `hace ${meses} meses`;
}

interface Props {
  prospecto: Prospecto | null;
}

export function ProspectoFicha({ prospecto }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // El relativo se calcula despues del mount: en el server "hace 3 dias" puede
  // dar distinto que en el browser y React se queja de la hidratacion.
  const [relativo, setRelativo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FichaForm>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      negocio: prospecto?.negocio ?? "",
      nombre_dueno: prospecto?.nombre_dueno ?? "",
      telefono: prospecto?.telefono ?? "",
      // Prospecto nuevo: la fecha de hoy ya puesta. Guardas sin tocarla y queda bien.
      fecha_contacto: prospecto?.fecha_contacto ?? (prospecto ? "" : hoyLocal()),
      notas: prospecto?.notas ?? "",
    },
  });

  const telefono = watch("telefono");
  const fechaContacto = watch("fecha_contacto");
  const wa = telefono ? waLink(telefono) : null;
  const etapa = STAGES.find((s) => s.id === (prospecto?.etapa ?? "lead"));

  useEffect(() => {
    setRelativo(fechaContacto ? haceCuanto(fechaContacto) : null);
  }, [fechaContacto]);

  async function onSave(data: FichaForm) {
    setSaving(true);
    const payload = {
      negocio: data.negocio || data.nombre_dueno,
      nombre_dueno: emptyToNull(data.nombre_dueno),
      telefono: emptyToNull(data.telefono),
      fecha_contacto: emptyToNull(data.fecha_contacto),
      notas: emptyToNull(data.notas),
    };

    if (prospecto?.id) {
      const { error } = await supabase
        .from("prospectos")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", prospecto.id);
      if (error) toast.error("No se guardó: " + error.message);
      else {
        toast.success("Guardado");
        router.refresh();
      }
    } else {
      const { data: creado, error } = await supabase
        .from("prospectos")
        .insert(payload)
        .select("id")
        .single();
      if (error) toast.error("No se guardó: " + error.message);
      else {
        toast.success("Prospecto creado");
        if (creado) router.replace(`/crm/${creado.id}`);
      }
    }
    setSaving(false);
  }

  function onInvalid() {
    const primero = Object.values(errors)[0]?.message;
    toast.error(primero ?? "Revisá los campos marcados");
  }

  // Ctrl/Cmd + S guarda. Sin animacion: es una accion de teclado.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSubmit(onSave, onInvalid)();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // Sin lista de dependencias a proposito: se re-suscribe en cada render para
    // que el handler vea los valores actuales del form. Es un listener, es barato.
  });

  async function onDelete() {
    if (!prospecto?.id) return;
    if (!confirm(`¿Borrar "${prospecto.negocio}"? No se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("prospectos").delete().eq("id", prospecto.id);
    if (error) {
      toast.error("No se pudo borrar: " + error.message);
      setDeleting(false);
      return;
    }
    toast.success("Prospecto borrado");
    router.push("/crm");
  }

  const titulo = prospecto?.negocio || prospecto?.nombre_dueno || "Nuevo prospecto";
  const subtitulo = prospecto
    ? [
        // T12:00 a proposito: formatDate parsea "2026-09-15" como UTC y en AR (UTC-3)
        // eso mostraba el dia anterior.
        fechaContacto ? `Contactado el ${formatDate(`${fechaContacto}T12:00:00`)}` : "Sin fecha de contacto",
        relativo,
        `Alta ${formatDate(prospecto.created_at)}`,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Cargá lo mínimo y guardá. Después completás.";

  return (
    <form onSubmit={handleSubmit(onSave, onInvalid)}>
      <Link
        href="/crm"
        className="inline-flex items-center gap-1.5 mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] [@media(hover:hover)]:hover:text-[var(--color-text-muted)] transition-colors duration-[140ms] ease-out"
      >
        <ArrowLeft size={12} />
        CRM
      </Link>

      <PageHead
        title={titulo}
        subtitle={subtitulo}
        actions={
          <>
            {prospecto && etapa && <Pill variant={prospecto.etapa} dot>{etapa.label}</Pill>}
            {prospecto?.id && (
              <IconButton
                type="button"
                onClick={onDelete}
                disabled={deleting}
                aria-label="Borrar prospecto"
                title="Borrar prospecto"
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
          <FieldRow label="Empresa" htmlFor="negocio" error={errors.negocio?.message}>
            <FieldInput
              id="negocio"
              autoComplete="organization"
              placeholder="Nombre del negocio"
              invalid={!!errors.negocio}
              {...register("negocio")}
            />
          </FieldRow>

          <FieldRow label="Nombre" htmlFor="nombre_dueno">
            <FieldInput
              id="nombre_dueno"
              autoComplete="name"
              placeholder="Con quién hablás"
              {...register("nombre_dueno")}
            />
          </FieldRow>

          <FieldRow
            label="Teléfono"
            htmlFor="telefono"
            action={
              telefono?.trim() ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${telefono.replace(/\s/g, "")}`}
                    aria-label="Llamar"
                    title="Llamar"
                    className="size-[38px] grid place-items-center rounded-[10px] border border-[var(--color-border-2)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-[background-color,border-color,color,transform] duration-[140ms] ease-out active:scale-[0.97] [@media(hover:hover)]:hover:text-[var(--color-text)] [@media(hover:hover)]:hover:border-[var(--color-border-3)]"
                  >
                    <Phone size={15} />
                  </a>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir WhatsApp"
                      title="Abrir WhatsApp"
                      className="size-[38px] grid place-items-center rounded-[10px] border border-[rgba(34,197,139,0.25)] bg-[rgba(34,197,139,0.08)] text-[var(--color-success)] transition-[background-color,border-color,transform] duration-[140ms] ease-out active:scale-[0.97] [@media(hover:hover)]:hover:bg-[rgba(34,197,139,0.14)]"
                    >
                      <MessageCircle size={15} />
                    </a>
                  )}
                </div>
              ) : undefined
            }
          >
            <FieldInput
              id="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              mono
              placeholder="+54 9 381 ..."
              {...register("telefono")}
            />
          </FieldRow>

          <FieldRow
            label="Contacto"
            htmlFor="fecha_contacto"
            hint="Cuándo lo contactaste. Si lo dejás vacío, queda sin fecha."
          >
            <FieldInput id="fecha_contacto" type="date" mono {...register("fecha_contacto")} />
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
              rows={10}
              className="min-h-[220px]"
              placeholder={"Qué se hizo y qué se ofreció.\n\nEj: Llamé el martes, hablé con Marcela. Le ofrecí la web + el bot de WhatsApp. Pidió presupuesto por escrito. Volver a llamar la semana que viene."}
              {...register("notas")}
            />
          </div>
        </Card>

        <div className="flex items-center gap-3 pb-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Guardando..." : prospecto ? "Guardar" : "Crear prospecto"}
          </Button>
          <span
            className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-text-dim)]"
            aria-live="polite"
          >
            {isDirty && !saving ? "sin guardar · ⌘S" : ""}
          </span>
        </div>
      </div>
    </form>
  );
}
