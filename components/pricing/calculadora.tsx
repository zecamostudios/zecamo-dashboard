"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { calcularPricing, pricingInputSchema, type PricingInputs, type PricingOutputs } from "@/lib/pricing/calculator";
import { createClient } from "@/lib/supabase/client";
import { formatUSD, formatPct, cn } from "@/lib/utils";
import { AREAS_PRICING } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import type { PricingCalculo } from "@/types/database";

const CLASIFICACION_STYLES: Record<string, { bg: string; text: string }> = {
  "Quick Win": { bg: "bg-green-50 border-green-200", text: "text-green-700" },
  "Big Win": { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  "Nice to have": { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  Despreciable: { bg: "bg-red-50 border-red-200", text: "text-red-700" },
};

interface Props {
  calculo: PricingCalculo | null;
  clientes: { id: string; nombre: string }[];
  prospectos: { id: string; negocio: string }[];
  userId: string;
}

export function PricingCalculadora({ calculo, clientes, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [outputs, setOutputs] = useState<PricingOutputs | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const defaultValues: PricingInputs = {
    nombre_solucion: calculo?.nombre_solucion || "",
    area: calculo?.area || "",
    descripcion: calculo?.descripcion || "",
    cliente_id: calculo?.cliente_id || null,
    prospecto_id: calculo?.prospecto_id || null,
    impacto: calculo?.impacto ?? 5,
    esfuerzo: calculo?.esfuerzo ?? 5,
    horas_semana_tarea: calculo?.horas_semana_tarea ?? 0,
    personas_afectadas: calculo?.personas_afectadas ?? 0,
    pct_tiempo_ahorrado: calculo?.pct_tiempo_ahorrado ?? 0,
    sueldo_mensual_empleado_usd: calculo?.sueldo_mensual_empleado_usd ?? 0,
    horas_semana_empleado: calculo?.horas_semana_empleado ?? 40,
    time_to_value_semanas: calculo?.time_to_value_semanas ?? 4,
    riesgo: calculo?.riesgo ?? 2,
    compliance_flag: calculo?.compliance_flag ?? false,
    fit_estrategico: calculo?.fit_estrategico ?? 3,
    horas_desarrollo: calculo?.horas_desarrollo ?? 0,
    tarifa_hora_usd: calculo?.tarifa_hora_usd ?? 50,
    costo_herramientas_mes_usd: calculo?.costo_herramientas_mes_usd ?? 0,
    costos_fijos_usd: calculo?.costos_fijos_usd ?? 0,
  };

  const { register, watch, control, handleSubmit, formState: { errors } } = useForm<PricingInputs>({
    resolver: zodResolver(pricingInputSchema),
    defaultValues,
    mode: "onChange",
  });

  const allValues = watch();

  useEffect(() => {
    const parsed = pricingInputSchema.safeParse(allValues);
    if (parsed.success) {
      setOutputs(calcularPricing(parsed.data));
    }
  }, [allValues]);

  async function onDelete() {
    if (!calculo?.id) return;
    if (!confirm(`¿Eliminar la calculación "${calculo.nombre_solucion}"?`)) return;
    setDeleting(true);
    const { error } = await supabase.from("pricing_calculos").delete().eq("id", calculo.id);
    if (error) { toast.error("Error: " + error.message); setDeleting(false); return; }
    toast.success("Calculación eliminada");
    router.push("/pricing");
  }

  async function onSave(data: PricingInputs) {
    if (!outputs) return;
    setSaving(true);
    const sharedFields = {
      nombre_solucion: data.nombre_solucion,
      area: data.area ?? null,
      descripcion: data.descripcion ?? null,
      cliente_id: data.cliente_id ?? null,
      prospecto_id: data.prospecto_id ?? null,
      impacto: data.impacto,
      esfuerzo: data.esfuerzo,
      horas_semana_tarea: data.horas_semana_tarea,
      personas_afectadas: data.personas_afectadas,
      pct_tiempo_ahorrado: data.pct_tiempo_ahorrado,
      sueldo_mensual_empleado_usd: data.sueldo_mensual_empleado_usd,
      horas_semana_empleado: data.horas_semana_empleado,
      time_to_value_semanas: data.time_to_value_semanas,
      riesgo: data.riesgo,
      compliance_flag: data.compliance_flag,
      fit_estrategico: data.fit_estrategico,
      horas_desarrollo: data.horas_desarrollo,
      tarifa_hora_usd: data.tarifa_hora_usd,
      costo_herramientas_mes_usd: data.costo_herramientas_mes_usd,
      costos_fijos_usd: data.costos_fijos_usd,
      costo_hora_empleado_usd: outputs.costo_hora_empleado_usd,
      ahorro_anual_usd: outputs.ahorro_anual_usd,
      costo_impl_usd: outputs.costo_impl_usd,
      valor_anual_cliente_usd: outputs.valor_anual_cliente_usd,
      roi_pct: outputs.roi_pct,
      roi_score: outputs.roi_score,
      esfuerzo_ajustado: outputs.esfuerzo_ajustado,
      score_final: outputs.score_final,
      clasificacion: outputs.clasificacion,
      precio_minimo_usd: outputs.precio_minimo_usd,
      precio_recomendado_usd: outputs.precio_recomendado_usd,
      precio_agresivo_usd: outputs.precio_agresivo_usd,
      ganancia_neta_usd: outputs.ganancia_neta_usd,
      margen_pct: outputs.margen_pct,
      meses_payback_cliente: outputs.meses_payback_cliente,
      mensual_min_usd: outputs.mensual_min_usd,
      mensual_ideal_usd: outputs.mensual_ideal_usd,
      alerta_margen: outputs.alerta_margen,
      alerta_pricing: outputs.alerta_pricing,
    };

    let error;
    if (calculo?.id) {
      ({ error } = await supabase.from("pricing_calculos").update({
        ...sharedFields,
        updated_at: new Date().toISOString(),
      }).eq("id", calculo.id));
    } else {
      const { error: insertError, data: inserted } = await supabase
        .from("pricing_calculos")
        .insert({ ...sharedFields, creado_por: userId })
        .select("id")
        .single();
      error = insertError;
      if (!error && inserted) {
        router.replace(`/pricing/${inserted.id}`);
      }
    }

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Guardado correctamente");
    }
    setSaving(false);
  }

  const clasificacion = outputs?.clasificacion;
  const clasStyle = clasificacion ? CLASIFICACION_STYLES[clasificacion] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pricing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{calculo ? calculo.nombre_solucion : "Nueva calculación"}</h1>
          <p className="text-sm text-muted-foreground">Calculadora de pricing de soluciones IA</p>
        </div>
        {calculo?.id && (
          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete} disabled={deleting}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda — inputs */}
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Identificación</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nombre de la solución *</Label>
                  <Input {...register("nombre_solucion")} placeholder="Ej: Chatbot de atención al cliente" />
                  {errors.nombre_solucion && <p className="text-xs text-destructive mt-1">{errors.nombre_solucion.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Área</Label>
                    <Controller
                      name="area"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
                          <SelectContent>
                            {AREAS_PRICING.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <Controller
                      name="cliente_id"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={v => field.onChange(v || null)}>
                          <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin cliente</SelectItem>
                            {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Impacto en el cliente</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Impacto (1-10)" name="impacto" register={register} min={1} max={10} />
                  <NumberInput label="Esfuerzo (1-10)" name="esfuerzo" register={register} min={1} max={10} />
                  <NumberInput label="Hs/semana de la tarea" name="horas_semana_tarea" register={register} />
                  <NumberInput label="Personas afectadas" name="personas_afectadas" register={register} />
                  <NumberInput label="% tiempo ahorrado (0-1)" name="pct_tiempo_ahorrado" register={register} step={0.1} min={0} max={1} />
                  <NumberInput label="Sueldo empleado/mes (USD)" name="sueldo_mensual_empleado_usd" register={register} />
                  <NumberInput label="Hs/semana empleado" name="horas_semana_empleado" register={register} />
                  <NumberInput label="Time to value (semanas)" name="time_to_value_semanas" register={register} />
                  <NumberInput label="Riesgo (1-5)" name="riesgo" register={register} min={1} max={5} />
                  <NumberInput label="Fit estratégico (1-5)" name="fit_estrategico" register={register} min={1} max={5} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="compliance_flag" {...register("compliance_flag")} className="rounded" />
                  <label htmlFor="compliance_flag" className="text-sm">Requiere compliance / certificación</label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Tus costos</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <NumberInput label="Horas de desarrollo" name="horas_desarrollo" register={register} />
                <NumberInput label="Tarifa hora (USD)" name="tarifa_hora_usd" register={register} />
                <NumberInput label="Herramientas/mes (USD)" name="costo_herramientas_mes_usd" register={register} />
                <NumberInput label="Costos fijos (USD)" name="costos_fijos_usd" register={register} />
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha — outputs */}
          <div className="space-y-5">
            {outputs && clasificacion && clasStyle && (
              <div className={cn("rounded-xl border-2 p-5 text-center", clasStyle.bg)}>
                <div className={cn("text-3xl font-black", clasStyle.text)}>{clasificacion}</div>
                <div className="text-5xl font-black mt-2 text-foreground">{outputs.score_final}</div>
                <div className="text-sm text-muted-foreground">score final / 10</div>
                {outputs.alerta_margen && (
                  <div className="mt-3 text-sm font-medium">{outputs.alerta_margen} · {outputs.alerta_pricing}</div>
                )}
              </div>
            )}

            {outputs && (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">Valor al cliente</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-y-3">
                    <OutputRow label="Ahorro anual" value={formatUSD(outputs.ahorro_anual_usd)} />
                    <OutputRow label="ROI" value={formatPct(outputs.roi_pct)} />
                    <OutputRow label="ROI score" value={`${outputs.roi_score}/10`} />
                    <OutputRow label="Esfuerzo ajustado" value={`${outputs.esfuerzo_ajustado}/10`} />
                    <OutputRow label="Payback cliente" value={`${outputs.meses_payback_cliente} meses`} />
                    <OutputRow label="Costo hs. empleado" value={formatUSD(outputs.costo_hora_empleado_usd)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Precios sugeridos</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-y-3">
                    <OutputRow label="Precio mínimo" value={formatUSD(outputs.precio_minimo_usd)} />
                    <OutputRow label="Precio recomendado" value={formatUSD(outputs.precio_recomendado_usd)} highlight />
                    <OutputRow label="Precio agresivo" value={formatUSD(outputs.precio_agresivo_usd)} />
                    <OutputRow label="Tu costo impl." value={formatUSD(outputs.costo_impl_usd)} />
                    <OutputRow label="Ganancia neta" value={formatUSD(outputs.ganancia_neta_usd)} />
                    <OutputRow label="Margen" value={formatPct(outputs.margen_pct)} />
                  </CardContent>
                </Card>

                {(outputs.mensual_min_usd > 0 || outputs.mensual_ideal_usd > 0) && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Retainer mensual</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-y-3">
                      <OutputRow label="Mínimo mensual" value={formatUSD(outputs.mensual_min_usd)} />
                      <OutputRow label="Ideal mensual" value={formatUSD(outputs.mensual_ideal_usd)} highlight />
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={saving}>
              <Save className="size-4" />
              {saving ? "Guardando..." : "Guardar calculación"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function NumberInput({ label, name, register, step = 1, min, max }: {
  label: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        step={step}
        min={min}
        max={max}
        className="mt-1"
        {...register(name, { valueAsNumber: true })}
      />
    </div>
  );
}

function OutputRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold text-right", highlight && "text-primary text-base")}>{value}</span>
    </>
  );
}
