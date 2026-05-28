"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import {
  ESTADOS_TAREA, ESTADOS_TAREA_LABELS,
  PRIORIDADES_TAREA, PRIORIDADES_LABELS, PRIORIDADES_COLORS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Calendar, Trash2 } from "lucide-react";
import type { Tarea } from "@/types/database";

const tareaSchema = z.object({
  titulo: z.string().min(1, "Requerido"),
  descripcion: z.string().optional(),
  asignado_a: z.string().optional().nullable(),
  prioridad: z.enum(PRIORIDADES_TAREA),
  estado: z.enum(ESTADOS_TAREA),
  fecha_limite: z.string().optional(),
  proyecto_id: z.string().optional().nullable(),
});

type TareaForm = z.infer<typeof tareaSchema>;

type TareaRow = Tarea & {
  asignado_nombre?: string | null;
};

interface Props {
  tareas: TareaRow[];
  profiles: { id: string; nombre: string | null }[];
  proyectos: { id: string; nombre: string }[];
  userId: string;
}

export function TareasKanban({ tareas, profiles, proyectos, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [editTarea, setEditTarea] = useState<TareaRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TareaForm>({
    resolver: zodResolver(tareaSchema),
    defaultValues: { prioridad: "media", estado: "todo" },
  });

  function openNew() {
    setEditTarea(null);
    reset({ prioridad: "media", estado: "todo" });
    setOpen(true);
  }

  function openEdit(t: TareaRow) {
    setEditTarea(t);
    reset({
      titulo: t.titulo,
      descripcion: t.descripcion || "",
      asignado_a: t.asignado_a,
      prioridad: t.prioridad as typeof PRIORIDADES_TAREA[number],
      estado: t.estado as typeof ESTADOS_TAREA[number],
      fecha_limite: t.fecha_limite || "",
      proyecto_id: t.proyecto_id,
    });
    setOpen(true);
  }

  async function onSave(data: TareaForm) {
    setSaving(true);
    let error;
    if (editTarea?.id) {
      ({ error } = await supabase.from("tareas").update({
        titulo: data.titulo,
        descripcion: data.descripcion ?? null,
        asignado_a: data.asignado_a ?? null,
        prioridad: data.prioridad,
        estado: data.estado,
        fecha_limite: data.fecha_limite ?? null,
        proyecto_id: data.proyecto_id ?? null,
        updated_at: new Date().toISOString(),
      }).eq("id", editTarea.id));
    } else {
      ({ error } = await supabase.from("tareas").insert({
        titulo: data.titulo,
        descripcion: data.descripcion ?? null,
        asignado_a: data.asignado_a ?? null,
        prioridad: data.prioridad,
        estado: data.estado,
        fecha_limite: data.fecha_limite ?? null,
        proyecto_id: data.proyecto_id ?? null,
        creado_por: userId,
      }));
    }
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success(editTarea ? "Tarea actualizada" : "Tarea creada");
      setOpen(false);
      router.refresh();
    }
    setSaving(false);
  }

  async function onDelete() {
    if (!editTarea?.id) return;
    if (!confirm(`¿Eliminar la tarea "${editTarea.titulo}"?`)) return;
    setDeleting(true);
    const { error } = await supabase.from("tareas").delete().eq("id", editTarea.id);
    if (error) { toast.error(error.message); setDeleting(false); return; }
    toast.success("Tarea eliminada");
    setOpen(false);
    router.refresh();
    setDeleting(false);
  }

  async function cambiarEstado(id: string, estado: typeof ESTADOS_TAREA[number]) {
    const { error } = await supabase.from("tareas").update({ estado, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button onClick={openNew}><Plus className="size-4" />Nueva tarea</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ESTADOS_TAREA.map(estado => {
          const items = tareas.filter(t => t.estado === estado);
          return (
            <div key={estado} className="bg-slate-100/80 rounded-xl p-3 space-y-2 min-h-[200px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {ESTADOS_TAREA_LABELS[estado]}
                </span>
                <span className="text-xs bg-white rounded-full px-2 py-0.5 font-medium">{items.length}</span>
              </div>
              {items.map(t => (
                <div key={t.id} className="bg-white rounded-lg p-3 border hover:shadow-sm transition-shadow">
                  <button onClick={() => openEdit(t)} className="text-left w-full">
                    <p className="font-medium text-sm">{t.titulo}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORIDADES_COLORS[t.prioridad as keyof typeof PRIORIDADES_COLORS]}`}>
                        {PRIORIDADES_LABELS[t.prioridad as keyof typeof PRIORIDADES_LABELS]}
                      </span>
                      {t.asignado_nombre && <span className="text-xs text-muted-foreground">{t.asignado_nombre}</span>}
                    </div>
                    {t.fecha_limite && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3" />{formatDate(t.fecha_limite)}
                      </div>
                    )}
                  </button>
                  {/* Quick move */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {ESTADOS_TAREA.filter(e => e !== estado).map(e => (
                      <button key={e} onClick={() => cambiarEstado(t.id, e)}
                        className="text-xs text-muted-foreground hover:text-primary">
                        → {ESTADOS_TAREA_LABELS[e]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarea ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSave)} className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input {...register("titulo")} />
              {errors.titulo && <p className="text-xs text-destructive mt-1">{errors.titulo.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prioridad</Label>
                <Controller name="prioridad" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES_TAREA.map(p => <SelectItem key={p} value={p}>{PRIORIDADES_LABELS[p]}</SelectItem>)}
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
                      {ESTADOS_TAREA.map(e => <SelectItem key={e} value={e}>{ESTADOS_TAREA_LABELS[e]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label>Asignar a</Label>
                <Controller name="asignado_a" control={control} render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={v => field.onChange(v || null)}>
                    <SelectTrigger><SelectValue placeholder="Nadie" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre || p.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label>Fecha límite</Label>
                <Input {...register("fecha_limite")} type="date" />
              </div>
            </div>
            <div>
              <Label>Proyecto</Label>
              <Controller name="proyecto_id" control={control} render={({ field }) => (
                <Select value={field.value || ""} onValueChange={v => field.onChange(v || null)}>
                  <SelectTrigger><SelectValue placeholder="Sin proyecto" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin proyecto</SelectItem>
                    {proyectos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <Label>Descripción</Label>
              <textarea {...register("descripcion")} rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-2 justify-between pt-2">
              {editTarea?.id && (
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete} disabled={deleting}>
                  <Trash2 className="size-3.5 mr-1" />{deleting ? "Eliminando..." : "Eliminar"}
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
