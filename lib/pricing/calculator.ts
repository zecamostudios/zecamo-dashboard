import { z } from "zod";

export const pricingInputSchema = z.object({
  nombre_solucion: z.string().min(1, "Requerido"),
  area: z.string().optional(),
  descripcion: z.string().optional(),
  cliente_id: z.string().uuid().optional().nullable(),
  prospecto_id: z.string().uuid().optional().nullable(),

  // Sobre la solución y el cliente
  impacto: z.number().min(1).max(10),
  esfuerzo: z.number().min(1).max(10),
  horas_semana_tarea: z.number().min(0),
  personas_afectadas: z.number().min(0),
  pct_tiempo_ahorrado: z.number().min(0).max(1),
  sueldo_mensual_empleado_usd: z.number().min(0),
  horas_semana_empleado: z.number().min(0),
  time_to_value_semanas: z.number().min(0),
  riesgo: z.number().min(1).max(5),
  compliance_flag: z.boolean(),
  fit_estrategico: z.number().min(1).max(5),

  // Costos
  horas_desarrollo: z.number().min(0),
  tarifa_hora_usd: z.number().min(0),
  costo_herramientas_mes_usd: z.number().min(0),
  costos_fijos_usd: z.number().min(0),
});

export type PricingInputs = z.infer<typeof pricingInputSchema>;

export interface PricingOutputs {
  costo_hora_empleado_usd: number;
  ahorro_anual_usd: number;
  costo_impl_usd: number;
  valor_anual_cliente_usd: number;
  roi_pct: number;
  roi_score: number;
  esfuerzo_ajustado: number;
  score_final: number;
  clasificacion: "Quick Win" | "Big Win" | "Nice to have" | "Despreciable";
  precio_minimo_usd: number;
  precio_recomendado_usd: number;
  precio_agresivo_usd: number;
  ganancia_neta_usd: number;
  margen_pct: number;
  meses_payback_cliente: number;
  mensual_min_usd: number;
  mensual_ideal_usd: number;
  alerta_margen: string;
  alerta_pricing: string;
}

export function calcularPricing(inputs: PricingInputs): PricingOutputs {
  const {
    impacto,
    esfuerzo,
    horas_semana_tarea,
    personas_afectadas,
    pct_tiempo_ahorrado,
    sueldo_mensual_empleado_usd,
    horas_semana_empleado,
    time_to_value_semanas,
    riesgo,
    compliance_flag,
    fit_estrategico,
    horas_desarrollo,
    tarifa_hora_usd,
    costo_herramientas_mes_usd,
    costos_fijos_usd,
  } = inputs;

  // Costo hora del empleado del cliente
  const costo_hora_empleado_usd =
    sueldo_mensual_empleado_usd > 0 && horas_semana_empleado > 0
      ? sueldo_mensual_empleado_usd / (horas_semana_empleado * 4.33)
      : 0;

  // Ahorro anual al cliente
  const ahorro_anual_usd =
    horas_semana_tarea * personas_afectadas * pct_tiempo_ahorrado * costo_hora_empleado_usd * 52;

  // Costo de implementación
  const costo_impl_usd = horas_desarrollo * tarifa_hora_usd + costos_fijos_usd;

  // Valor anual = ahorro anual (modelo conservador)
  const valor_anual_cliente_usd = ahorro_anual_usd;

  // ROI
  const roi_pct =
    costo_impl_usd <= 0 ? 0 : (valor_anual_cliente_usd - costo_impl_usd) / costo_impl_usd;

  // ROI score (1-10)
  const roi_score = Math.max(
    0,
    Math.min(10, 5 + 2.5 * Math.log(1 + Math.max(-0.99, roi_pct)))
  );

  // Esfuerzo ajustado (penaliza TTV largo, riesgo alto, compliance)
  const esfuerzo_ajustado = Math.min(
    10,
    esfuerzo +
      Math.max(0, time_to_value_semanas - 8) * 0.2 +
      riesgo * 0.5 +
      (compliance_flag ? 1 : 0)
  );

  // Score final
  const score_raw =
    0.45 * impacto +
    0.35 * roi_score +
    0.2 * (10 - esfuerzo_ajustado) +
    0.1 * (fit_estrategico || 0);
  const score_final = Math.round(Math.max(1, Math.min(10, score_raw)) * 10) / 10;

  // Clasificación
  let clasificacion: PricingOutputs["clasificacion"];
  if (roi_pct < 0) {
    clasificacion = "Despreciable";
  } else if (impacto >= 7 && esfuerzo_ajustado <= 5) {
    clasificacion = "Quick Win";
  } else if (impacto >= 7) {
    clasificacion = "Big Win";
  } else if (esfuerzo_ajustado <= 5) {
    clasificacion = "Nice to have";
  } else {
    clasificacion = "Despreciable";
  }

  // Precios
  const precio_minimo_usd =
    costo_impl_usd === 0 ? 0 : costo_impl_usd * (2 + riesgo * 0.3);

  const precio_recomendado_usd =
    valor_anual_cliente_usd === 0
      ? precio_minimo_usd
      : Math.max(
          precio_minimo_usd,
          valor_anual_cliente_usd * (0.15 + (esfuerzo_ajustado / 10) * 0.25)
        );

  const precio_agresivo_usd =
    valor_anual_cliente_usd === 0
      ? precio_minimo_usd
      : Math.max(
          precio_minimo_usd,
          valor_anual_cliente_usd * (0.25 + (esfuerzo_ajustado / 10) * 0.25)
        );

  // Ganancia y margen
  const ganancia_neta_usd = precio_recomendado_usd - costo_impl_usd;
  const margen_pct = precio_recomendado_usd > 0 ? ganancia_neta_usd / precio_recomendado_usd : 0;

  // Payback cliente
  const meses_payback_cliente =
    valor_anual_cliente_usd > 0
      ? Math.round((precio_recomendado_usd / valor_anual_cliente_usd) * 12 * 10) / 10
      : 0;

  // Mensualidades (retainer)
  const mensual_min_usd = costo_herramientas_mes_usd > 0 ? costo_herramientas_mes_usd * 1.4 : 0;
  const mensual_ideal_usd =
    costo_herramientas_mes_usd > 0
      ? costo_herramientas_mes_usd * 2 + (ahorro_anual_usd / 12) * 0.1
      : 0;

  // Alertas
  let alerta_margen = "";
  if (costo_impl_usd > 0) {
    if (margen_pct < 0.3) alerta_margen = "⚠️ MARGEN BAJO";
    else if (margen_pct < 0.5) alerta_margen = "⚡ OK";
    else alerta_margen = "✅ EXCELENTE";
  }

  let alerta_pricing = "";
  if (costo_impl_usd > 0) {
    if (precio_recomendado_usd < costo_impl_usd * 1.5) alerta_pricing = "🔴 Regalando trabajo";
    else if (meses_payback_cliente > 6) alerta_pricing = "🟡 Payback largo";
    else alerta_pricing = "🟢 Buen deal";
  }

  return {
    costo_hora_empleado_usd: Math.round(costo_hora_empleado_usd * 100) / 100,
    ahorro_anual_usd: Math.round(ahorro_anual_usd),
    costo_impl_usd: Math.round(costo_impl_usd),
    valor_anual_cliente_usd: Math.round(valor_anual_cliente_usd),
    roi_pct: Math.round(roi_pct * 1000) / 1000,
    roi_score: Math.round(roi_score * 10) / 10,
    esfuerzo_ajustado: Math.round(esfuerzo_ajustado * 10) / 10,
    score_final,
    clasificacion,
    precio_minimo_usd: Math.round(precio_minimo_usd),
    precio_recomendado_usd: Math.round(precio_recomendado_usd),
    precio_agresivo_usd: Math.round(precio_agresivo_usd),
    ganancia_neta_usd: Math.round(ganancia_neta_usd),
    margen_pct: Math.round(margen_pct * 1000) / 1000,
    meses_payback_cliente,
    mensual_min_usd: Math.round(mensual_min_usd),
    mensual_ideal_usd: Math.round(mensual_ideal_usd),
    alerta_margen,
    alerta_pricing,
  };
}
