"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatUSD, formatDate } from "@/lib/utils";
import { ESTADOS_CLIENTE, ESTADOS_CLIENTE_LABELS, ESTADOS_PROYECTO_COLORS, ESTADOS_PROYECTO_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Building2, Lightbulb, Wrench } from "lucide-react";
import type { Cliente, Proyecto, Transaccion } from "@/types/database";

const clienteSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  contacto_nombre: z.string().optional(),
  contacto_email: z.string().email("Email inválido").optional().or(z.literal("")),
  contacto_tel: z.string().optional(),
  fecha_inicio: z.string().optional(),
  mrr_usd: z.number().min(0).optional(),
  estado: z.enum(ESTADOS_CLIENTE),
  notas: z.string().optional(),
  descripcion_negocio: z.string().optional(),
  problema_principal: z.string().optional(),
  solucion_implementada: z.string().optional(),
});

type ClienteForm = z.infer<typeof clienteSchema>;

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "nuevo";
  const router = useRouter();
  const supabase = createClient();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { estado: "activo", mrr_usd: 0 },
  });

  useEffect(() => {
    if (isNew) return;
    async function load() {
      try {
        const { data: c, error: cErr } = await supabase.from("clientes").select("id, nombre, contacto_nombre, contacto_email, contacto_tel, fecha_inicio, mrr_usd, estado, notas, created_at").eq("id", id).single();
        if (cErr || !c) { router.push("/clientes"); return; }

        // Fetch new columns separately so missing migration doesn't break the whole page
        const { data: extra } = await supabase.from("clientes").select("descripcion_negocio, problema_principal, solucion_implementada").eq("id", id).single();

        setCliente({ ...c, descripcion_negocio: extra?.descripcion_negocio ?? null, problema_principal: extra?.problema_principal ?? null, solucion_implementada: extra?.solucion_implementada ?? null });
        reset({
          nombre: c.nombre,
          contacto_nombre: c.contacto_nombre || "",
          contacto_email: c.contacto_email || "",
          contacto_tel: c.contacto_tel || "",
          fecha_inicio: c.fecha_inicio || "",
          mrr_usd: c.mrr_usd,
          estado: c.estado as typeof ESTADOS_CLIENTE[number],
          notas: c.notas || "",
          descripcion_negocio: extra?.descripcion_negocio || "",
          problema_principal: extra?.problema_principal || "",
          solucion_implementada: extra?.solucion_implementada || "",
        });

        const { data: p } = await supabase.from("proyectos").select("*").eq("cliente_id", id).order("created_at", { ascending: false });
        setProyectos(p || []);

        const { data: t } = await supabase.from("transacciones").select("*").eq("cliente_id", id).order("fecha", { ascending: false }).limit(10);
        setTransacciones(t || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onDelete() {
    if (!cliente?.id) return;
    if (!confirm(`¿Eliminar el cliente "${cliente.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("clientes").delete().eq("id", cliente.id);
    if (error) { toast.error("Error: " + error.message); setDeleting(false); return; }
    toast.success("Cliente eliminado");
    router.push("/clientes");
  }

  async function onSave(data: ClienteForm) {
    setSaving(true);
    const payload = {
      nombre: data.nombre,
      contacto_nombre: data.contacto_nombre ?? null,
      contacto_email: data.contacto_email ?? null,
      contacto_tel: data.contacto_tel ?? null,
      fecha_inicio: data.fecha_inicio ?? null,
      mrr_usd: data.mrr_usd ?? 0,
      estado: data.estado,
      notas: data.notas ?? null,
      descripcion_negocio: data.descripcion_negocio ?? null,
      problema_principal: data.problema_principal ?? null,
      solucion_implementada: data.solucion_implementada ?? null,
    };
    let error;
    if (cliente?.id) {
      ({ error } = await supabase.from("clientes").update(payload).eq("id", cliente.id));
    } else {
      const { error: e, data: inserted } = await supabase.from("clientes").insert(payload).select("id").single();
      error = e;
      if (!e && inserted) router.replace(`/clientes/${inserted.id}`);
    }
    if (error) toast.error("Error: " + error.message);
    else toast.success("Guardado");
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes"><Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{cliente?.nombre || "Nuevo cliente"}</h1>
          {cliente && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              cliente.estado === "activo" ? "bg-green-100 text-green-700" :
              cliente.estado === "pausado" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {ESTADOS_CLIENTE_LABELS[cliente.estado as keyof typeof ESTADOS_CLIENTE_LABELS]}
            </span>
          )}
        </div>
        {cliente?.id && (
          <Button variant="ghost" size="icon" className="ml-auto text-destructive hover:text-destructive" onClick={onDelete} disabled={deleting}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        {/* Ficha técnica — destacada arriba */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                El negocio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                {...register("descripcion_negocio")}
                rows={4}
                placeholder="¿A qué se dedica? ¿Cómo genera dinero? ¿Cuánta gente tienen?"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="size-4 text-amber-500" />
                El problema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                {...register("problema_principal")}
                rows={4}
                placeholder="¿Qué dolor tiene? ¿Qué proceso los frena? ¿Cuánto les cuesta ese problema?"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="size-4 text-green-600" />
                La solución
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                {...register("solucion_implementada")}
                rows={4}
                placeholder="¿Qué construimos para ellos? ¿Qué herramienta o flujo de IA implementamos?"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </CardContent>
          </Card>
        </div>

        {/* Datos + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Datos del cliente</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label>Nombre de la empresa *</Label>
                  <Input {...register("nombre")} />
                  {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
                </div>
                <div><Label>Contacto principal</Label><Input {...register("contacto_nombre")} /></div>
                <div><Label>Email</Label><Input {...register("contacto_email")} type="email" /></div>
                <div><Label>Teléfono</Label><Input {...register("contacto_tel")} /></div>
                <div><Label>Fecha inicio</Label><Input {...register("fecha_inicio")} type="date" /></div>
                <div>
                  <Label>MRR (USD/mes)</Label>
                  <Input {...register("mrr_usd", { valueAsNumber: true })} type="number" min={0} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Controller name="estado" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS_CLIENTE.map(e => <SelectItem key={e} value={e}>{ESTADOS_CLIENTE_LABELS[e]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Notas internas</Label>
                  <textarea {...register("notas")} rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {proyectos.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Proyectos</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {proyectos.map(p => (
                    <Link key={p.id} href={`/proyectos/${p.id}`}
                      className="flex items-center justify-between py-1.5 hover:text-primary transition-colors">
                      <span className="text-sm">{p.nombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADOS_PROYECTO_COLORS[p.estado as keyof typeof ESTADOS_PROYECTO_COLORS]}`}>
                        {ESTADOS_PROYECTO_LABELS[p.estado as keyof typeof ESTADOS_PROYECTO_LABELS]}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {transacciones.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Últimas transacciones</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {transacciones.map(t => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{t.descripcion || t.categoria || "—"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(t.fecha)}</p>
                      </div>
                      <span className={t.tipo === "ingreso" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {t.tipo === "ingreso" ? "+" : "-"}{formatUSD(t.monto_usd)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
