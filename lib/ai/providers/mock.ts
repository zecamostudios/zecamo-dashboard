/**
 * MockProvider — default provider when no API key is configured.
 * Generates realistic Spanish content about AI automation for SMBs.
 * Deterministic per prompt (same input → same output), varied across inputs.
 */
import type { AIProvider, GenerationRequest, GenerationResponse, ScoringResponse } from "./base";
import type { AIGenerationType, ContentPlatform } from "@/lib/types";

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// ── Hook templates ──────────────────────────────────────────────────────────
const HOOK_SETS = [
  {
    hooks: [
      "Automatizamos las ventas de una clínica dental. En 6 semanas: de 3 a 18 pacientes nuevos por mes.",
      "El 78% de los negocios que 'usan IA' no tienen ningún proceso automatizado. Los que sí, duplican capacidad.",
      "Nadie habla del verdadero costo de no automatizar: tu equipo trabaja el doble para crecer la mitad.",
    ],
    best: 0,
    explanation: "El primer hook tiene un resultado concreto y medible que genera credibilidad inmediata.",
  },
  {
    hooks: [
      "Le devolví 3 horas diarias a una agencia de 8 personas. Lo que cambió no fue el equipo, fue el proceso.",
      "Tu competencia ya automatizó lo que vos hacés a mano. Y por eso crece más rápido que vos.",
      "El problema no es la tecnología. Es que nadie te enseñó cómo implementarla en tu negocio real.",
    ],
    best: 0,
    explanation: "Resultado específico con contexto de equipo. Genera curiosidad sobre el cómo.",
  },
  {
    hooks: [
      "Implementamos IA en una inmobiliaria en 3 semanas. Ahora sus brokers cierran el doble con el mismo equipo.",
      "Si tu negocio depende de que alguien recuerde hacer algo, tenés un problema de escala.",
      "3 automatizaciones que toda PyME debería tener. Y ninguna cuesta lo que pensás.",
    ],
    best: 2,
    explanation: "El tercero genera curiosidad y destruye la objeción de precio antes de que aparezca.",
  },
  {
    hooks: [
      "Cómo pasamos de 40 emails de seguimiento por semana a 0 — sin perder ningún lead.",
      "El onboarding de clientes nuevos les tomaba 2 semanas. Ahora tarda 2 días. Esto es lo que hicimos.",
      "La razón por la que no escalás no es el equipo. Es el proceso. Y los procesos se automatizan.",
    ],
    best: 1,
    explanation: "Transformación clara con números antes/después que genera credibilidad inmediata.",
  },
];

// ── Post templates ───────────────────────────────────────────────────────────
const POST_TEMPLATES = [
  {
    hook: "Automatizamos el seguimiento de leads de una agencia de marketing. Esto es lo que pasó.",
    content: `Automatizamos el seguimiento de leads de una agencia de marketing. Esto es lo que pasó.

El problema real: tenían un comercial mandando 40 emails por semana a mano. Copy-paste. Uno por uno. 3 horas diarias de trabajo que no escala.

¿El resultado?
→ Leads fríos que se enfriaban aún más por la demora
→ Respuestas inconsistentes por cansancio
→ Zero tiempo para conversaciones reales de cierre

Lo que implementamos:
→ Secuencia de nurturing automática en 3 touchpoints
→ Personalización dinámica con datos del CRM
→ Notificación al comercial solo cuando hay señal de interés real
→ Dashboard de conversión por fuente de lead

En 4 semanas:
→ 40 → 0 emails manuales por semana
→ Tasa de respuesta de 8% → 23%
→ El comercial ahora cierra en vez de escribir

La IA no reemplazó al comercial. Le devolvió el tiempo para hacer lo que solo él puede hacer.

¿Qué proceso en tu negocio consume más tiempo hoy?`,
    cta: "¿Qué proceso en tu negocio consume más tiempo hoy?",
    hashtags: ["#automatizacion", "#marketingdigital", "#inteligenciaartificial", "#agencia"],
  },
  {
    hook: "3 automatizaciones que toda PyME debería tener. Y ninguna cuesta lo que pensás.",
    content: `3 automatizaciones que toda PyME debería tener. Y ninguna cuesta lo que pensás.

Después de implementar en más de 20 negocios, estas son las que más ROI generan:

1. Seguimiento automático de leads
No más copy-paste de emails. El sistema detecta la etapa del lead y dispara el mensaje correcto en el momento correcto. Resultado promedio: 3x más respuestas con 80% menos tiempo.

2. Onboarding de clientes
El proceso de incorporar un cliente nuevo no debería depender de que alguien recuerde los pasos. Checklists automáticos, documentos que se generan solos, recordatorios internos. De 2 semanas a 3 días.

3. Reportes y métricas
Si un miembro de tu equipo pasa más de 30 minutos por semana armando un reporte, ese tiempo se puede recuperar hoy. Dashboards que se actualizan solos, alertas cuando algo sale del parámetro.

El costo de no tenerlas: tu equipo trabaja el doble para crecer la mitad.

¿Cuál de estas tres ya tenés implementada?`,
    cta: "¿Cuál de estas tres ya tenés implementada?",
    hashtags: ["#automatizacion", "#pymes", "#inteligenciaartificial", "#eficiencia"],
  },
  {
    hook: "Le devolvimos 15 horas semanales a un estudio contable de 12 personas. Sin contratar a nadie.",
    content: `Le devolvimos 15 horas semanales a un estudio contable de 12 personas. Sin contratar a nadie.

El problema: el 60% del tiempo de los contadores era tarea administrativa.

Reunir documentación de clientes. Mandar recordatorios de vencimientos. Actualizar planillas de control. Responder las mismas 8 preguntas por WhatsApp.

Nada de eso requiere un contador. Pero lo estaban haciendo contadores.

Lo que hicimos en 3 semanas:
→ Portal de carga de documentos con notificaciones automáticas
→ Sistema de recordatorios de vencimientos conectado al calendario de cada cliente
→ Chatbot de WhatsApp para las consultas frecuentes
→ Dashboard de estado de trabajo para el equipo

El resultado a los 2 meses:
→ 15 horas semanales recuperadas por el equipo
→ Capacidad para incorporar 4 clientes nuevos sin ampliar staff
→ 0 vencimientos perdidos desde la implementación

Lo que más les cambió: los contadores ahora hacen trabajo de contadores.

Si querés saber cómo aplicarlo en tu negocio, mandame un DM.`,
    cta: "Si querés saber cómo aplicarlo en tu negocio, mandame un DM.",
    hashtags: ["#automatizacion", "#contabilidad", "#inteligenciaartificial", "#pymes"],
  },
];

// ── Thread templates ─────────────────────────────────────────────────────────
const THREAD_TEMPLATES = [
  {
    tweets: [
      { n: 1, text: "Cómo automatizamos las ventas de una clínica dental con n8n + IA. Un hilo." },
      { n: 2, text: "El problema: 2 administrativas respondiendo WhatsApp 8 horas por día. 12 preguntas repetidas. Turnos perdidos. Burnout total." },
      { n: 3, text: "La solución no fue contratar más. Fue automatizar los flujos que ya existían pero nadie había mapeado." },
      { n: 4, text: "Implementamos en 3 semanas:\n→ Chatbot WhatsApp 24/7\n→ Agendado automático en el CRM\n→ Recordatorios 24h antes\n→ Seguimiento post-turno" },
      { n: 5, text: "Resultado a las 6 semanas:\n→ De 3 a 18 pacientes nuevos por mes\n→ 0 turnos perdidos\n→ Las admins ahora venden en vez de coordinar" },
      { n: 6, text: "La IA no reemplazó a nadie. Le devolvió el tiempo a personas que trabajaban el doble de lo necesario." },
      { n: 7, text: "Si tenés un proceso que consume más tiempo del que debería, probablemente se puede automatizar.\n\n¿Cuál es el tuyo?" },
    ],
    hook: "Cómo automatizamos las ventas de una clínica dental con n8n + IA. Un hilo.",
    cta: "Si tenés un proceso que consume más tiempo del que debería, probablemente se puede automatizar. ¿Cuál es el tuyo?",
  },
  {
    tweets: [
      { n: 1, text: "El error más común que veo en PyMEs cuando intentan implementar IA. Un hilo corto." },
      { n: 2, text: "Compran la herramienta antes de entender el problema.\n\nChatGPT, Copilot, Make, Zapier... y después no saben qué hacer con ellas." },
      { n: 3, text: "La automatización empieza mapeando el proceso actual, no eligiendo la herramienta." },
      { n: 4, text: "Pregunta correcta:\n¿Qué proceso consume más tiempo de mi equipo por semana?\n\nNo: ¿Qué herramienta de IA debería usar?" },
      { n: 5, text: "Una vez que identificás el proceso:\n→ Mapeás los pasos\n→ Identificás cuáles son repetibles\n→ Automatizás esos\n→ Tu equipo hace el resto" },
      { n: 6, text: "El 90% de las automatizaciones que implementamos resuelven procesos que el cliente tenía documentados mentalmente pero nunca en papel." },
      { n: 7, text: "¿Qué proceso en tu negocio harías primero si alguien te dijera que lo puede automatizar esta semana?" },
    ],
    hook: "El error más común que veo en PyMEs cuando intentan implementar IA. Un hilo corto.",
    cta: "¿Qué proceso en tu negocio harías primero si alguien te dijera que lo puede automatizar esta semana?",
  },
];

// ── Carousel templates ────────────────────────────────────────────────────────
const CAROUSEL_TEMPLATES = [
  {
    slides: [
      { n: 1, titulo: "5 señales de que tu negocio necesita automatización ya", cuerpo: "Si reconocés 3 o más, es momento de actuar.", nota_visual: "Título grande, fondo oscuro, número destacado" },
      { n: 2, titulo: "Señal #1: Alguien responde las mismas preguntas todos los días", cuerpo: "Si tenés un FAQ en la cabeza de alguien, tenés un chatbot sin hacer.", nota_visual: "Ícono de chat, color de alerta" },
      { n: 3, titulo: "Señal #2: Los seguimientos se hacen a mano en una planilla", cuerpo: "Una planilla de Excel no es un CRM. Y un CRM mal usado tampoco.", nota_visual: "Ícono de tabla/hoja de cálculo" },
      { n: 4, titulo: "Señal #3: El onboarding depende de que alguien recuerde hacerlo", cuerpo: "Si el proceso de incorporar un cliente nuevo vive en la cabeza de alguien, es frágil.", nota_visual: "Ícono de checklist" },
      { n: 5, titulo: "Señal #4: Los reportes tardan horas y se hacen con copia-pega", cuerpo: "Si armás el mismo reporte todas las semanas, se puede automatizar.", nota_visual: "Ícono de gráfico/dashboard" },
      { n: 6, titulo: "Señal #5: Crecés, pero también crece el caos operativo", cuerpo: "El caos no es una etapa. Es una señal de que los procesos no escalan.", nota_visual: "Ícono de escalera/flecha" },
      { n: 7, titulo: "Si reconocés 3 o más, tenemos que hablar", cuerpo: "Empezamos en 2 semanas. Sin compromisos de largo plazo.\n\nMandame un DM.", nota_visual: "CTA claro, color de acción" },
    ],
    hook: "5 señales de que tu negocio necesita automatización ya",
    cta: "Si reconocés 3 o más, mandame un DM. Empezamos en 2 semanas.",
  },
  {
    slides: [
      { n: 1, titulo: "Cómo automatizamos un negocio en 3 semanas (paso a paso)", cuerpo: "El proceso exacto que usamos con cada cliente.", nota_visual: "Número 3 grande, fondo con gradiente" },
      { n: 2, titulo: "Semana 1: Mapeo de procesos", cuerpo: "Identificamos los 3 procesos que más tiempo consumen. Los mapeamos en detalle. Sin esta base, cualquier automatización falla.", nota_visual: "Diagrama simple de flujo" },
      { n: 3, titulo: "Semana 1: Definición de herramientas", cuerpo: "n8n para los flujos. Supabase o Notion para los datos. WhatsApp/email para la comunicación. Sin reinventar la rueda.", nota_visual: "Logos de herramientas" },
      { n: 4, titulo: "Semana 2: Build + pruebas", cuerpo: "Construimos los flujos. Los testeamos con datos reales del negocio. Ajustamos hasta que funciona perfecto.", nota_visual: "Código/interface de n8n" },
      { n: 5, titulo: "Semana 3: Go live + capacitación", cuerpo: "Activamos en producción. Capacitamos al equipo en 2 horas. Dejamos documentación. El cliente opera solo.", nota_visual: "Cohete despegando" },
      { n: 6, titulo: "El resultado promedio a los 30 días", cuerpo: "10-20 horas semanales recuperadas. Procesos que antes dependían de personas ahora corren solos.", nota_visual: "Números antes/después" },
      { n: 7, titulo: "¿Querés el mismo proceso para tu negocio?", cuerpo: "Mandame un DM y agendamos una sesión de mapeo gratuita.", nota_visual: "CTA con foto del equipo" },
    ],
    hook: "Cómo automatizamos un negocio en 3 semanas (el proceso exacto)",
    cta: "Mandame un DM y agendamos una sesión de mapeo gratuita.",
  },
];

// ── Rewrite templates ────────────────────────────────────────────────────────
const REWRITE_TEMPLATES = [
  {
    original_issues: ["El hook no interrumpe el scroll", "Muy genérico, sin resultado concreto", "No hay CTA claro"],
    rewritten: `Automatizamos un proceso que le consumía 12 horas semanales a tu equipo.

No es magia. Es mapear bien lo que ya hacés y dejar que la tecnología lo ejecute.

Resultado de nuestro último cliente: de 12 horas a 45 minutos. Misma calidad, menos desgaste.

¿Cuánto tiempo pierde tu equipo en lo mismo cada semana?`,
    improvements: ["Hook específico con número real", "Narrativa concreta con antes/después", "CTA como pregunta que genera reflexión"],
    hook: "Automatizamos un proceso que le consumía 12 horas semanales a tu equipo.",
  },
  {
    original_issues: ["Comienza con nosotros/yo (focus en la marca, no en el cliente)", "No hay tensión ni curiosidad", "Demasiado técnico para el público general"],
    rewritten: `Tu equipo hace cosas que no debería hacer.

No porque sean malos en su trabajo — sino porque nadie mapeó qué partes se pueden automatizar.

Eso es lo que hacemos nosotros: identificamos exactamente qué consume más tiempo, lo automatizamos en 2-3 semanas, y tu equipo se dedica a lo que realmente mueve la aguja.

Sin humo. Sin promesas de "IA que lo hace todo". Solo flujos que funcionan.

Si querés saber si aplica para tu negocio, mandame un DM.`,
    improvements: ["Empieza hablando del cliente, no de la marca", "Tensión inmediata con la primera línea", "Lenguaje simple, sin tecnicismos"],
    hook: "Tu equipo hace cosas que no debería hacer.",
  },
];

export class MockProvider implements AIProvider {
  readonly name   = "mock";
  readonly isMock = true;

  async generate(req: GenerationRequest): Promise<GenerationResponse> {
    const seed = hash(req.prompt + req.tipo + req.plataforma);
    await new Promise((r) => setTimeout(r, 600 + (seed % 800)));

    switch (req.tipo) {
      case "hook":     return this._hook(seed);
      case "post":     return this._post(seed);
      case "thread":   return this._thread(seed);
      case "carousel": return this._carousel(seed);
      case "rewrite":  return this._rewrite(seed);
    }
  }

  private _hook(seed: number): GenerationResponse {
    const t = pick(HOOK_SETS, seed);
    return { content: t.hooks[t.best], hook: t.hooks[t.best], alternatives: t.hooks, cta: undefined, tokens: 312, model: "mock-v1" };
  }

  private _post(seed: number): GenerationResponse {
    const t = pick(POST_TEMPLATES, seed);
    return { content: t.content, hook: t.hook, cta: t.cta, hashtags: t.hashtags, tokens: 687, model: "mock-v1" };
  }

  private _thread(seed: number): GenerationResponse {
    const t = pick(THREAD_TEMPLATES, seed);
    return {
      content: t.tweets.map((tw) => `${tw.n}/ ${tw.text}`).join("\n\n"),
      hook: t.hook, cta: t.cta, tokens: 521, model: "mock-v1",
      raw: { tweets: t.tweets },
    };
  }

  private _carousel(seed: number): GenerationResponse {
    const t = pick(CAROUSEL_TEMPLATES, seed);
    return {
      content: t.slides.map((s) => `Slide ${s.n}: ${s.titulo}\n${s.cuerpo}`).join("\n\n---\n\n"),
      hook: t.hook, cta: t.cta, tokens: 743, model: "mock-v1",
      raw: { slides: t.slides },
    };
  }

  private _rewrite(seed: number): GenerationResponse {
    const t = pick(REWRITE_TEMPLATES, seed);
    return { content: t.rewritten, hook: t.hook, cta: undefined, tokens: 445, model: "mock-v1", raw: t };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async score(content: string, _tipo: AIGenerationType, _plataforma: ContentPlatform): Promise<ScoringResponse> {
    const seed = hash(content);
    const base = 6 + (seed % 4);
    return {
      score: base,
      feedback: `El contenido tiene buen hook y estructura clara. ${base >= 8 ? "El CTA es específico y genera acción directa." : "El CTA podría ser más específico para aumentar conversión."}`,
      breakdown: {
        hook:        Math.min(10, base + (seed % 2)),
        clarity:     Math.min(10, base),
        cta:         Math.min(10, base - 1 + (seed % 3)),
        engagement:  Math.min(10, base + 1 - (seed % 2)),
      },
    };
  }
}
