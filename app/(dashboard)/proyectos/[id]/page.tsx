"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ESTADOS_PROYECTO, ESTADOS_PROYECTO_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { Proyecto } from "@/types/database";

const proyectoSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  cliente_id: z.string().uuid("Seleccioná un cliente"),
  descripcion: z.string().optional(),
  estado: z.enum(ESTADOS_PROYECTO),
  fecha_inicio: z.string().optional(),
  fecha_entrega: z.string().optional(),
  precio_total_usd: z.number().min(0).optional().nullable(),
  horas_estimadas: z.number().min(0).optional().nullable(),
  horas_reales: z.number().min(0).optional(),
});

type ProyectoForm = z.infer<typeof proyectoSchema>;

export default function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "nuevo";
  const router = useRouter();
  const supabase = createClient();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProyectoForm>({
    resolver: zodResolver(proyectoSchema),
    defaultValues: { estado: "propuesta", horas_reales: 0 },
  });

  useEffect(() => {
    async function load() {
      const { data: cs } = await supabase.from("clientes").select("id, nombre").order("nombre");
      setClientes(cs || []);

      if (!isNew) {
        const { data: p } = await supabase.from("proyectos").select("*").eq("id", id).single();
        if (!p) { router.push("/proyectos"); return; }
        setProyecto(p);
        reset({
          nombre: p.nombre,
          cliente_id: p.cliente_id,
          descripcion: p.descripcion || "",
          estado: p.estado as typeof ESTADOS_PROYECTO[number],
          fecha_inicio: p.fecha_inicio || "",
          fecha_entrega: p.fecha_entrega || "",
          precio_total_usd: p.precio_total_usd,
          horas_estimadas: p.horas_estimadas,
          horas_reales: p.horas_reales,
        });
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onDelete() {
    if (!proyecto?.id) return;
    if (!confirm(`¿Eliminar el proyecto "${proyecto.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("proyectos").delete().eq("id", proyecto.id);
    if (error) { toast.error("Error: " + error.message); setDeleting(false); return; }
    toast.success("Proyecto eliminado");
    router.push("/proyectos");
  }

  async function onSave(data: ProyectoForm) {
    setSaving(true);
    let error;
    if (proyecto?.id) {
      ({ error } = await supabase.from("proyectos").update({
        cliente_id: data.cliente_id,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        estado: data.estado,
        fecha_inicio: data.fecha_inicio ?? null,
        fecha_entrega: data.fecha_entrega ?? null,
        precio_total_usd: data.precio_total_usd ?? null,
        horas_estimadas: data.horas_estimadas ?? null,
        horas_reales: data.horas_reales ?? 0,
        updated_at: new Date().toISOString(),
      }).eq("id", proyecto.id));
    } else {
      const { error: e, data: inserted } = await supabase.from("proyectos").insert({
        cliente_id: data.cliente_id,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        estado: data.estado,
        fecha_inicio: data.fecha_inicio ?? null,
        fecha_entrega: data.fecha_entrega ?? null,
        precio_total_usd: data.precio_total_usd ?? null,
        horas_estimadas: data.horas_estimadas ?? null,
        horas_reales: data.horas_reales ?? 0,
      }).select("id").single();
      error = e;
      if (!e && inserted) router.replace(`/proyectos/${inserted.id}`);
    }
    if (error) toast.error("Error: " + error.message);
    else toast.success("Guardado");
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/proyectos"><Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button></Link>
        <h1 className="text-2xl font-bold">{proyecto?.nombre || "Nuevo proyecto"}</h1>
        {proyecto?.id && (
          <Button variant="ghost" size="icon" className="ml-auto text-destructive hover:text-destructive" onClick={onDelete} disabled={deleting}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        <Card className="max-w-2xl">
          <CardHeader><CardTitle className="text-base">Datos del proyecto</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Nombre *</Label>
              <Input {...register("nombre")} />
              {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <Label>Cliente *</Label>
              <Controller name="cliente_id" control={control} render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {errors.cliente_id && <p className="text-xs text-destructive mt-1">{errors.cliente_id.message}</p>}
            </div>
            <div>
              <Label>Estado</Label>
              <Controller name="estado" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_PROYECTO.map(e => <SelectItem key={e} value={e}>{ESTADOS_PROYECTO_LABELS[e]}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div><Label>Fecha inicio</Label><Input {...register("fecha_inicio")} type="date" /></div>
            <div><Label>Fecha entrega</Label><Input {...register("fecha_entrega")} type="date" /></div>
            <div><Label>Precio total (USD)</Label><Input {...register("precio_total_usd", { valueAsNumber: true })} type="number" min={0} /></div>
            <div><Label>Horas estimadas</Label><Input {...register("horas_estimadas", { valueAsNumber: true })} type="number" min={0} /></div>
            <div><Label>Horas reales</Label><Input {...register("horas_reales", { valueAsNumber: true })} type="number" min={0} /></div>
            <div className="sm:col-span-2">
              <Label>Descripción</Label>
              <textarea {...register("descripcion")} rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
