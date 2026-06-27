"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import {
  ESTADOS_PROSPECTO, ESTADOS_PROSPECTO_LABELS, ESTADOS_PROSPECTO_COLORS,
  FUENTES_PROSPECTO, FUENTES_LABELS, TIPOS_INTERACCION,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, Mail, MessageSquare, FileText, Video, Trash2, PhoneCall, CalendarClock } from "lucide-react";
import type { Prospecto, InteraccionProspecto } from "@/types/database";

const prospectoSchema = z.object({
  negocio: z.string().min(1, "Requerido"),
  nombre_dueno: z.string().optional(),
  nombre_portero: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  fuente: z.string().optional(),
  fecha_contacto: z.string().optional(),
  volver_a_llamar: z.string().optional(),
  // Antes era z.enum(ESTADOS_PROSPECTO): si el prospecto venía con un estado
  // legacy/SDR fuera del enum, la validación fallaba en silencio y Guardar no
  // hacía nada. Lo dejamos como string para no bloquear el submit.
  estado: z.string().min(1, "Requerido"),
  notas: z.string().optional(),
  notas_llamadas: z.string().optional(),
  ultimo_resultado: z.string().optional(),
  asignado_a: z.string().optional().nullable(),
});

type ProspectoForm = z.infer<typeof prospectoSchema>;

const TIPO_ICONS: Record<string, React.ReactNode> = {
  llamada: <Phone className="size-3.5" />,
  email: <Mail className="size-3.5" />,
  mensaje: <MessageSquare className="size-3.5" />,
  reunion: <Video className="size-3.5" />,
  nota: <FileText className="size-3.5" />,
};

interface Props {
  prospecto: (Prospecto & { profiles?: { id: string; nombre: string | null } | null }) | null;
  interacciones: (InteraccionProspecto & { profiles?: { nombre: string | null } | null })[];
  profiles: { id: string; nombre: string | null }[];
  userId: string;
}

export function CrmDetalle({ prospecto, interacciones, profiles, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingInt, setAddingInt] = useState(false);
  const [intTipo, setIntTipo] = useState("nota");
  const [intContenido, setIntContenido] = useState("");

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProspectoForm>({
    resolver: zodResolver(prospectoSchema),
    defaultValues: {
      negocio: prospecto?.negocio || "",
      nombre_dueno: prospecto?.nombre_dueno || "",
      nombre_portero: prospecto?.nombre_portero || "",
      telefono: prospecto?.telefono || "",
      email: prospecto?.email || "",
      fuente: prospecto?.fuente || "",
      fecha_contacto: prospecto?.fecha_contacto || "",
      volver_a_llamar: prospecto?.volver_a_llamar || "",
      estado: (prospecto?.estado as typeof ESTADOS_PROSPECTO[number]) || "initiated",
      notas: prospecto?.notas || "",
      notas_llamadas: prospecto?.notas_llamadas || "",
      ultimo_resultado: prospecto?.ultimo_resultado || "",
      asignado_a: prospecto?.asignado_a || null,
    },
  });

  async function onDelete() {
    if (!prospecto?.id) return;
    if (!confirm(`¿Eliminar el prospecto "${prospecto.negocio}"? Esto borrará también todas sus interacciones.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("prospectos").delete().eq("id", prospecto.id);
    if (error) { toast.error("Error: " + error.message); setDeleting(false); return; }
    toast.success("Prospecto eliminado");
    router.push("/crm");
  }

  function onInvalid(errs: Record<string, { message?: string }>) {
    const first = Object.values(errs)[0]?.message;
    toast.error(first ? `Revisá el formulario: ${first}` : "Hay campos inválidos en el formulario");
  }

  async function onSave(data: ProspectoForm) {
    setSaving(true);
    const sharedPayload = {
      negocio: data.negocio,
      nombre_dueno: data.nombre_dueno ?? null,
      nombre_portero: data.nombre_portero ?? null,
      telefono: data.telefono ?? null,
      email: data.email ?? null,
      fuente: data.fuente ?? null,
      fecha_contacto: data.fecha_contacto ?? null,
      volver_a_llamar: data.volver_a_llamar ?? null,
      estado: data.estado,
      notas: data.notas ?? null,
      notas_llamadas: data.notas_llamadas ?? null,
      ultimo_resultado: data.ultimo_resultado ?? null,
      asignado_a: data.asignado_a ?? null,
    };

    let error;
    if (prospecto?.id) {
      ({ error } = await supabase.from("prospectos").update({ ...sharedPayload, updated_at: new Date().toISOString() }).eq("id", prospecto.id));
    } else {
      const { error: e, data: inserted } = await supabase.from("prospectos").insert(sharedPayload).select("id").single();
      error = e;
      if (!e && inserted) router.replace(`/crm/${inserted.id}`);
    }

    if (error) toast.error("Error al guardar: " + error.message);
    else toast.success("Guardado");
    setSaving(false);
  }

  async function addInteraccion() {
    if (!prospecto?.id || !intContenido.trim()) return;
    setAddingInt(true);
    const { error } = await supabase.from("interacciones_prospecto").insert({
      prospecto_id: prospecto.id,
      tipo: intTipo,
      contenido: intContenido,
      creado_por: userId,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Interacción registrada");
      setIntContenido("");
      router.refresh();
    }
    setAddingInt(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/crm">
          <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{prospecto?.negocio || "Nuevo prospecto"}</h1>
          {prospecto?.id && (
            <Button variant="ghost" size="icon" className="ml-auto text-destructive hover:text-destructive" onClick={onDelete} disabled={deleting}>
              <Trash2 className="size-4" />
            </Button>
          )}
          {prospecto && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADOS_PROSPECTO_COLORS[prospecto.estado as keyof typeof ESTADOS_PROSPECTO_COLORS]}`}>
              {ESTADOS_PROSPECTO_LABELS[prospecto.estado as keyof typeof ESTADOS_PROSPECTO_LABELS]}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSubmit(onSave, onInvalid)}>
            <Card>
              <CardHeader><CardTitle className="text-base">Datos del prospecto</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label>Negocio / Empresa *</Label>
                  <Input {...register("negocio")} />
                  {errors.negocio && <p className="text-xs text-destructive mt-1">{errors.negocio.message}</p>}
                </div>
                <div>
                  <Label>Nombre del dueño</Label>
                  <Input {...register("nombre_dueno")} />
                </div>
                <div>
                  <Label>Nombre del portero</Label>
                  <Input {...register("nombre_portero")} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input {...register("telefono")} placeholder="+54 9..." />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input {...register("email")} type="email" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label>Fuente</Label>
                  <Controller name="fuente" control={control} render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
                      <SelectContent>
                        {FUENTES_PROSPECTO.map(f => (
                          <SelectItem key={f} value={f}>{FUENTES_LABELS[f]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Controller name="estado" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS_PROSPECTO.map(e => (
                          <SelectItem key={e} value={e}>{ESTADOS_PROSPECTO_LABELS[e]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label>Fecha primer contacto</Label>
                  <Input {...register("fecha_contacto")} type="date" />
                </div>
                <div>
                  <Label>Asignado a</Label>
                  <Controller name="asignado_a" control={control} render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={v => field.onChange(v || null)}>
                      <SelectTrigger><SelectValue placeholder="Nadie" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {profiles.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.nombre || p.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Notas generales</Label>
                  <textarea
                    {...register("notas")}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Observaciones relevantes..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Seguimiento de llamadas */}
          <form onSubmit={handleSubmit(onSave, onInvalid)}>
            <Card className="border-2 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PhoneCall className="size-4 text-blue-500" />
                  Seguimiento de llamadas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-amber-500" />
                    Volver a llamar
                  </Label>
                  <Input
                    {...register("volver_a_llamar")}
                    placeholder="Ej: Martes 15hs, o 2025-06-10"
                    className="border-amber-200 focus-visible:ring-amber-400"
                  />
                </div>
                <div>
                  <Label>Resultado última llamada</Label>
                  <Input
                    {...register("ultimo_resultado")}
                    placeholder="Ej: Interesado, llamar martes · No tiene presupuesto ahora"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Notas acumuladas de llamadas</Label>
                  <textarea
                    {...register("notas_llamadas")}
                    rows={5}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={`Acumulá info útil para la próxima llamada:\n• Mencionó que tienen 5 empleados en admin\n• Le interesa automatizar facturación\n• Hablar con el dueño (Juan), no con la secretaria\n• Mejor horario: martes/jueves después de las 17h`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Este campo se guarda entre llamadas — usalo para no repetir preguntas y entrar al grano.</p>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={saving} variant="outline">
                    {saving ? "Guardando..." : "Guardar seguimiento"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {prospecto?.id && (
            <Card>
              <CardHeader><CardTitle className="text-base">Registrar interacción</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select value={intTipo} onValueChange={v => setIntTipo(v || "nota")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_INTERACCION.map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <textarea
                  value={intContenido}
                  onChange={e => setIntContenido(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="¿Qué pasó?"
                />
                <Button onClick={addInteraccion} disabled={addingInt || !intContenido.trim()} className="w-full">
                  {addingInt ? "Guardando..." : "Agregar"}
                </Button>
              </CardContent>
            </Card>
          )}

          {interacciones.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Historial</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {interacciones.map(i => (
                  <div key={i.id} className="flex gap-2">
                    <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                      {TIPO_ICONS[i.tipo] || <MessageSquare className="size-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {i.tipo} · {formatDate(i.fecha)}
                        {i.profiles?.nombre && ` · ${i.profiles.nombre}`}
                      </p>
                      <p className="text-sm mt-0.5">{i.contenido}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
