"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { CANALES_OUTBOUND } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Plus, Send } from "lucide-react";
import type { OutboundCampana, OutboundEnvio } from "@/types/database";

const campanaSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  canal: z.string().optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  notas: z.string().optional(),
});
type CampanaForm = z.infer<typeof campanaSchema>;

const ESTADOS_ENVIO = ["enviado", "respondido", "interesado", "no_interesado", "rebotado"] as const;
const ESTADOS_ENVIO_COLORS: Record<string, string> = {
  enviado: "bg-blue-100 text-blue-700",
  respondido: "bg-violet-100 text-violet-700",
  interesado: "bg-green-100 text-green-700",
  no_interesado: "bg-red-100 text-red-700",
  rebotado: "bg-slate-100 text-slate-600",
};

export default function OutboundDetallePage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "nuevo";
  const router = useRouter();
  const supabase = createClient();

  const [campana, setCampana] = useState<OutboundCampana | null>(null);
  const [envios, setEnvios] = useState<OutboundEnvio[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  // New envio form
  const [newAsunto, setNewAsunto] = useState("");
  const [newContenido, setNewContenido] = useState("");
  const [addingEnvio, setAddingEnvio] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CampanaForm>({
    resolver: zodResolver(campanaSchema),
    defaultValues: { nombre: "", canal: "", fecha_inicio: "", fecha_fin: "", notas: "" },
  });

  useEffect(() => {
    if (isNew) return;
    async function load() {
      try {
        const { data: c, error } = await supabase.from("outbound_campanas").select("*").eq("id", id).single();
        if (error || !c) { router.push("/outbound"); return; }
        setCampana(c);
        reset({
          nombre: c.nombre,
          canal: c.canal || "",
          fecha_inicio: c.fecha_inicio || "",
          fecha_fin: c.fecha_fin || "",
          notas: c.notas || "",
        });
        const { data: e } = await supabase.from("outbound_envios").select("*").eq("campana_id", id).order("fecha", { ascending: false });
        setEnvios(e || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onDelete() {
    if (!campana?.id) return;
    if (!confirm(`¿Eliminar la campaña "${campana.nombre}"?`)) return;
    setDeleting(true);
    const { error } = await supabase.from("outbound_campanas").delete().eq("id", campana.id);
    if (error) { toast.error(error.message); setDeleting(false); return; }
    toast.success("Campaña eliminada");
    router.push("/outbound");
  }

  async function onSave(data: CampanaForm) {
    setSaving(true);
    const payload = {
      nombre: data.nombre,
      canal: data.canal || null,
      fecha_inicio: data.fecha_inicio || null,
      fecha_fin: data.fecha_fin || null,
      notas: data.notas || null,
    };
    let error;
    if (campana?.id) {
      ({ error } = await supabase.from("outbound_campanas").update(payload).eq("id", campana.id));
    } else {
      const { error: e, data: inserted } = await supabase.from("outbound_campanas").insert(payload).select("id").single();
      error = e;
      if (!e && inserted) router.replace(`/outbound/${inserted.id}`);
    }
    if (error) toast.error(error.message);
    else toast.success("Guardado");
    setSaving(false);
  }

  async function addEnvio() {
    if (!campana?.id || !newAsunto.trim()) return;
    setAddingEnvio(true);
    const { error } = await supabase.from("outbound_envios").insert({
      campana_id: campana.id,
      asunto: newAsunto,
      contenido: newContenido || null,
      estado: "enviado",
    });
    if (error) { toast.error(error.message); }
    else {
      setNewAsunto("");
      setNewContenido("");
      toast.success("Envío registrado");
      router.refresh();
    }
    setAddingEnvio(false);
  }

  async function updateEnvioEstado(envioId: string, nuevoEstado: string) {
    const { error } = await supabase.from("outbound_envios").update({ estado: nuevoEstado }).eq("id", envioId);
    if (error) { toast.error(error.message); return; }
    setEnvios(prev => prev.map(e => e.id === envioId ? { ...e, estado: nuevoEstado } : e));
  }

  if (loading) return <div className="p-8 text-muted-foreground">Cargando...</div>;

  const respondidos = envios.filter(e => e.estado === "respondido" || e.estado === "interesado").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/outbound"><Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{campana?.nombre || "Nueva campaña"}</h1>
          {campana && (
            <p className="text-xs text-muted-foreground">
              {envios.length} envíos · {respondidos} respondieron ({envios.length > 0 ? Math.round((respondidos / envios.length) * 100) : 0}%)
            </p>
          )}
        </div>
        {campana?.id && (
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete} disabled={deleting}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onSave)}>
            <Card>
              <CardHeader><CardTitle className="text-base">Datos de la campaña</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nombre *</Label>
                  <Input {...register("nombre")} placeholder="Ej: Cold email Marzo" />
                  {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
                </div>
                <div>
                  <Label>Canal</Label>
                  <Controller name="canal" control={control} render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {CANALES_OUTBOUND.map(c => (
                          <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label>Fecha inicio</Label>
                  <Input {...register("fecha_inicio")} type="date" />
                </div>
                <div>
                  <Label>Fecha fin</Label>
                  <Input {...register("fecha_fin")} type="date" />
                </div>
                <div>
                  <Label>Notas</Label>
                  <textarea
                    {...register("notas")}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Descripción de la campaña, objetivo, etc."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {campana?.id && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="size-4" />Registrar envío</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Asunto / contacto *</Label>
                  <Input value={newAsunto} onChange={e => setNewAsunto(e.target.value)} placeholder="Nombre del prospecto o asunto del mensaje" />
                </div>
                <div>
                  <Label>Mensaje (opcional)</Label>
                  <textarea
                    value={newContenido}
                    onChange={e => setNewContenido(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Contenido del mensaje enviado..."
                  />
                </div>
                <Button onClick={addEnvio} disabled={addingEnvio || !newAsunto.trim()}>
                  <Send className="size-4" />
                  {addingEnvio ? "Registrando..." : "Registrar envío"}
                </Button>
              </CardContent>
            </Card>
          )}

          {envios.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Envíos ({envios.length})</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {envios.map(e => {
                  const estadoActual: string = e.estado ?? "enviado";
                  const envioId: string = e.id;
                  return (
                    <div key={e.id} className="flex items-start justify-between gap-3 py-2 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.asunto || "Sin asunto"}</p>
                        {e.contenido && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.contenido}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(e.fecha)}</p>
                      </div>
                      <Select value={estadoActual} onValueChange={v => updateEnvioEstado(envioId, v ?? "enviado")}>
                        <SelectTrigger className="w-36 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_ENVIO.map(s => (
                            <SelectItem key={s} value={s} className="text-xs">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${ESTADOS_ENVIO_COLORS[s] || ""}`}>
                                {s.charAt(0).toUpperCase() + s.replace("_", " ").slice(1)}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {campana?.id && envios.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Todavía no hay envíos registrados en esta campaña.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
