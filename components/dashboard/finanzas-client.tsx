"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatUSD, formatDate } from "@/lib/utils";
import { TIPOS_TRANSACCION, CATEGORIAS_TRANSACCION } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Plus, Pencil, Trash2 } from "lucide-react";

const txSchema = z.object({
  fecha: z.string().min(1),
  tipo: z.enum(TIPOS_TRANSACCION),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  monto_usd: z.number().min(0.01),
  metodo_pago: z.string().optional(),
  cliente_id: z.string().optional().nullable(),
});

type TxForm = z.infer<typeof txSchema>;

interface TxRow {
  id: string;
  fecha: string;
  tipo: string;
  categoria: string | null;
  descripcion: string | null;
  monto_usd: number;
  cliente_nombre?: string;
}

interface Props {
  transacciones: TxRow[];
  clientes: { id: string; nombre: string }[];
}

function buildChartData(txs: TxRow[]) {
  const months: Record<string, { mes: string; ingresos: number; egresos: number }> = {};
  txs.forEach(t => {
    const key = t.fecha.slice(0, 7);
    if (!months[key]) months[key] = { mes: key, ingresos: 0, egresos: 0 };
    if (t.tipo === "ingreso") months[key].ingresos += t.monto_usd;
    else months[key].egresos += t.monto_usd;
  });
  return Object.values(months).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);
}

export function FinanzasClient({ transacciones, clientes }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [editTx, setEditTx] = useState<TxRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TxForm>({
    resolver: zodResolver(txSchema),
    defaultValues: { tipo: "ingreso", fecha: new Date().toISOString().slice(0, 10) },
  });

  function openNew() {
    setEditTx(null);
    reset({ tipo: "ingreso", fecha: new Date().toISOString().slice(0, 10) });
    setOpen(true);
  }

  function openEdit(t: TxRow) {
    setEditTx(t);
    reset({
      fecha: t.fecha,
      tipo: t.tipo as "ingreso" | "egreso",
      categoria: t.categoria ?? undefined,
      descripcion: t.descripcion ?? undefined,
      monto_usd: t.monto_usd,
      cliente_id: t.id ? undefined : undefined,
    });
    setOpen(true);
  }

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return;
    const { error } = await supabase.from("transacciones").delete().eq("id", id);
    if (error) toast.error("Error: " + error.message);
    else { toast.success("Eliminada"); router.refresh(); }
  }

  async function onSave(data: TxForm) {
    setSaving(true);
    const payload = {
      fecha: data.fecha,
      tipo: data.tipo,
      monto_usd: data.monto_usd,
      categoria: data.categoria ?? null,
      descripcion: data.descripcion ?? null,
      metodo_pago: data.metodo_pago ?? null,
      cliente_id: data.cliente_id ?? null,
    };
    let error;
    if (editTx?.id) {
      ({ error } = await supabase.from("transacciones").update(payload).eq("id", editTx.id));
    } else {
      ({ error } = await supabase.from("transacciones").insert(payload));
    }
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success(editTx ? "Transacción actualizada" : "Transacción registrada");
      setOpen(false);
      reset();
      router.refresh();
    }
    setSaving(false);
  }

  const chartData = buildChartData(transacciones);
  const filtered = filtroTipo === "todos" ? transacciones : transacciones.filter(t => t.tipo === filtroTipo);

  return (
    <>
      {/* Gráfico */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Ingresos vs egresos (últimos 6 meses)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => formatUSD(Number(v))} />
              <Legend />
              <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" radius={[4,4,0,0]} />
              <Bar dataKey="egresos" fill="#ef4444" name="Egresos" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex gap-2">
            {["todos", "ingreso", "egreso"].map(t => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filtroTipo === t ? "bg-primary text-white" : "bg-slate-100 text-muted-foreground hover:bg-slate-200"}`}>
                {t === "todos" ? "Todos" : t === "ingreso" ? "Ingresos" : "Egresos"}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={openNew}><Plus className="size-3.5" />Nueva</Button>
        </div>

        <div className="divide-y">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t.descripcion || t.categoria || "Sin descripción"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(t.fecha)} · {t.cliente_nombre || t.categoria || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${t.tipo === "ingreso" ? "text-green-600" : "text-red-600"}`}>
                  {t.tipo === "ingreso" ? "+" : "-"}{formatUSD(t.monto_usd)}
                </span>
                <button onClick={() => openEdit(t)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-muted-foreground transition-opacity">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => onDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-destructive transition-opacity">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground text-sm">No hay transacciones</p>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTx ? "Editar transacción" : "Nueva transacción"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSave)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha</Label>
                <Input {...register("fecha")} type="date" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Controller name="tipo" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_TRANSACCION.map(t => <SelectItem key={t} value={t}>{t === "ingreso" ? "Ingreso" : "Egreso"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label>Categoría</Label>
                <Controller name="categoria" control={control} render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_TRANSACCION.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div>
                <Label>Monto (USD) *</Label>
                <Input {...register("monto_usd", { valueAsNumber: true })} type="number" min={0.01} step={0.01} />
                {errors.monto_usd && <p className="text-xs text-destructive mt-1">Requerido</p>}
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Input {...register("descripcion")} />
            </div>
            <div>
              <Label>Cliente</Label>
              <Controller name="cliente_id" control={control} render={({ field }) => (
                <Select value={field.value || ""} onValueChange={v => field.onChange(v || null)}>
                  <SelectTrigger><SelectValue placeholder="Sin cliente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin cliente</SelectItem>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
