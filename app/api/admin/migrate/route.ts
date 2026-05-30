import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Protected endpoint: requires ADMIN_SECRET header
// DDL (CREATE TABLE / ALTER TABLE) must be applied via Supabase SQL editor first.
// This endpoint seeds brand_memory and platform_accounts with initial data.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const results: Record<string, string> = {};

  // Seed brand_memory
  const brandSeeds = [
    { categoria: "tono", clave: "tono_general", valor: "Profesional pero cercano. Sin tecnicismos innecesarios. Directo al punto.", descripcion: "El tono general de la marca", orden: 1 },
    { categoria: "tono", clave: "personalidad", valor: "Confiable, moderno, ejecutable. Hablamos de resultados reales, no de teoría.", descripcion: "Personalidad de marca", orden: 2 },
    { categoria: "tono", clave: "idioma", valor: "Español rioplatense. Vos/nosotros. Sin anglicismos innecesarios.", descripcion: "Idioma y registro", orden: 3 },
    { categoria: "posicionamiento", clave: "propuesta_valor", valor: "Automatizamos los procesos más costosos de los negocios usando IA para que escalen sin aumentar el equipo.", descripcion: "Propuesta de valor central", orden: 1 },
    { categoria: "posicionamiento", clave: "diferenciacion", valor: "Implementamos, no consultamos. En semanas, no meses. Sin setup fees absurdos.", descripcion: "Diferenciación competitiva", orden: 2 },
    { categoria: "posicionamiento", clave: "prueba_social", valor: "Más de 20 negocios automatizados. Clínicas, agencias, inmobiliarias, estudios contables.", descripcion: "Prueba social", orden: 3 },
    { categoria: "servicios", clave: "aima", valor: "AIMA: Automatización con IA. Flujos n8n + IA integrados en las operaciones reales del negocio.", descripcion: "Servicio AIMA", orden: 1 },
    { categoria: "servicios", clave: "webs", valor: "Webs: Sitios y landing pages que convierten. Next.js, Framer, Webflow. Diseño que vende.", descripcion: "Servicio Webs", orden: 2 },
    { categoria: "servicios", clave: "b2b", valor: "B2B Outbound: Sistemas de prospección automatizada en LinkedIn y email frío. Volumen con personalización.", descripcion: "Servicio B2B Outbound", orden: 3 },
    { categoria: "audiencia", clave: "perfil_principal", valor: "Dueños de PyMEs y gerentes operativos. 5-50 empleados. Ya usan herramientas digitales. Sienten que podrían hacer más con menos.", descripcion: "Perfil del cliente ideal", orden: 1 },
    { categoria: "audiencia", clave: "dolores", valor: "Tareas repetitivas que consumen tiempo del equipo. Seguimiento manual de leads. Onboarding lento. Reportes hechos a mano. Crecimiento que genera caos.", descripcion: "Dolores principales", orden: 2 },
    { categoria: "audiencia", clave: "objeciones", valor: "Creen que es caro. Creen que necesitan un equipo técnico. Tuvieron malas experiencias previas con tecnología.", descripcion: "Objeciones comunes", orden: 3 },
    { categoria: "pilares", clave: "pilar_resultados", valor: "Resultados reales: Casos de uso con números reales, transformaciones de clientes.", descripcion: "Pilar 1", orden: 1 },
    { categoria: "pilares", clave: "pilar_educacion", valor: "Educación práctica: Cómo funciona la IA aplicada a negocios. Sin humo, sin buzzwords.", descripcion: "Pilar 2", orden: 2 },
    { categoria: "pilares", clave: "pilar_proceso", valor: "Proceso: Qué hacemos, cómo lo hacemos, por qué funciona. Transparencia total.", descripcion: "Pilar 3", orden: 3 },
    { categoria: "pilares", clave: "pilar_cultura", valor: "Cultura: El equipo, la visión, el por qué detrás de Zecamo. Humanizar la agencia.", descripcion: "Pilar 4", orden: 4 },
    { categoria: "cta_patterns", clave: "cta_engagement", valor: "¿Qué proceso en tu negocio consume más tiempo hoy?", descripcion: "CTA de engagement estándar", orden: 1 },
    { categoria: "cta_patterns", clave: "cta_consulta", valor: "Si te interesa, agendamos una llamada de 20 minutos sin compromiso.", descripcion: "CTA de consulta", orden: 2 },
    { categoria: "cta_patterns", clave: "cta_leadgen", valor: "Escribime 'AUTOMATIZACIÓN' y te mando el caso completo.", descripcion: "CTA lead gen", orden: 3 },
    { categoria: "vocabulario", clave: "terminos_positivos", valor: "ejecutable, concreto, resultado, implementar, automatizar, escalar, operaciones, eficiencia, transformación", descripcion: "Términos a usar", orden: 1 },
    { categoria: "restricciones", clave: "evitar", valor: "buzzwords vacíos (disruptivo, innovador, revolucionario), promesas sin sustento, tecnicismos innecesarios, anglicismos que tienen equivalente en español", descripcion: "Qué evitar", orden: 1 },
  ];

  const { error: brandErr } = await supabase
    .from("brand_memory")
    .upsert(brandSeeds, { onConflict: "categoria,clave", ignoreDuplicates: true });

  results.brand_memory = brandErr ? `error: ${brandErr.message}` : `seeded ${brandSeeds.length} entries`;

  // Seed platform_accounts (mock)
  const accountSeeds = [
    { plataforma: "linkedin", nombre_cuenta: "Zecamo LinkedIn", username: "zecamo", is_mock: true, activo: true },
    { plataforma: "twitter",  nombre_cuenta: "Zecamo Twitter",  username: "zecamo_studios", is_mock: true, activo: true },
    { plataforma: "instagram",nombre_cuenta: "Zecamo Instagram",username: "zecamo.studios", is_mock: true, activo: true },
  ];

  const { error: accErr } = await supabase
    .from("platform_accounts")
    .upsert(accountSeeds, { onConflict: "plataforma,username", ignoreDuplicates: true });

  results.platform_accounts = accErr ? `error: ${accErr.message}` : `seeded ${accountSeeds.length} accounts`;

  return NextResponse.json({ ok: true, results });
}
