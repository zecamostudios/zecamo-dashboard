# WF-SDR-Agent — Research + Outreach personalizado (diseño)

**Fecha:** 2026-06-18
**Autor:** Joaco (Zecamo Studios) + Claude
**Estado:** Aprobado, listo para plan de implementación

## 1. Objetivo

Llevar el sistema de prospección al siguiente nivel: un agente que, por tandas,
agarra leads ya scrapeados (tabla `leads`), **investiga** cada negocio online,
arma un **mensaje/propuesta personalizada** con lo que Zecamo le podría hacer, y
lo entrega multicanal:

- **Email** encontrado → se **envía solo** por Gmail (con tope diario).
- **WhatsApp / Instagram** → queda como **borrador** en el dashboard para que Joaco
  lo mande a mano.

Meta: prospección a gran escala sin perder personalización ni control del gasto.

## 2. Contexto / stack existente

- **n8n** (instancia Zecamo, `zecamon8n.zecamostudios.com`). Ya existe
  `WF-Outbound-SDR` (id `8aU2Ios4Rjsg8Oa9`) que llena `leads` vía Google Places +
  scoring IA. Este diseño agrega un **segundo** workflow downstream.
- **Supabase** del dashboard Zecamo (ref `wlvogtjpldglpiufnryy`), tabla
  `public.leads` (migración 0011). RLS por `auth.uid()`; el service_role bypassa RLS.
- **Dashboard** Next.js 14 (`zecamo-dashboard`), página `/outbound/cola`
  (`components/outbound/LeadsQueue.tsx`), API en `app/api/outbound/`.
- **Credenciales n8n:** OpenAI `zecamo-openai` (`ZKmo5sQ0e6Fy8VOe`), Supabase SDR
  (`TGnYQvwf2ZIdmYLl`), Google Places (`9sx9BLeX3gzOPeql`).
- **Catálogo de servicios Zecamo** (para `servicios_sugeridos`): Automatización con
  IA (n8n), Vibe Coding (webs/apps/landings), Agentes IA B2B, Consultoría IA, +
  kits (web scrolling, SEO, Meta Ads, dashboard, etc.).

## 3. Decisiones de diseño (cerradas en brainstorming)

| Dimensión | Decisión |
|---|---|
| Autonomía de envío | **Híbrido**: Gmail envía solo (tope diario); WSP/IG = borrador manual |
| Profundidad de research | **Medio**: web + redes (IG desde el link de su web) + reseñas |
| Output | **Por canal** (email asunto+cuerpo con 2-3 mejoras; WSP/IG corto) + **ficha** de research |
| Trigger | **Por tandas**, disparadas por Joaco (botón "Investigar top N") |
| Arquitectura | **Pipeline determinista en n8n** (no agente autónomo) |
| Research social | **Sin API nueva**: IG sale del link en la web; reseñas de Place Details |

## 4. Arquitectura

```
Dashboard /outbound/cola
   │  botón "Investigar top N" (default top 20 pendientes por score)
   ▼
POST /api/outbound/investigar  (Next.js route, requireAuth)
   │  body: { lead_ids: string[] }
   ▼
Webhook n8n  POST /webhook/sdr-agent   (WF-SDR-Agent)
   │  por cada lead_id:
   ├─ 1. Supabase: traer la fila del lead (solo si estado ∈ {prospecto_pendiente, aprobado})
   ├─ 2. Research:
   │      a. HTTP GET web del lead → email + link IG + texto (qué ofrece / qué le falta)
   │      b. Place Details (place_id) → reseñas recientes
   │      c. rating + nº reseñas (ya en la fila)
   ├─ 3. Síntesis: 1 llamada LLM (gpt-4o, JSON) → ficha + mensajes + email detectado
   ├─ 4. Entrega:
   │      - si email && bajo el tope diario → Gmail envía → estado 'contactado'
   │      - si no → borrador → estado 'investigado'
   └─ 5. Supabase: update de la fila con todo
   ▼
Dashboard muestra ficha + email + mensaje corto (router.refresh)
```

El dashboard queda **fino** (dispara + muestra). Toda la lógica de outreach vive en n8n.

## 5. Modelo de datos — migración `0012_leads_research_outreach.sql`

Aditiva sobre `public.leads` (no rompe 0011 ni el WF-Outbound-SDR):

```sql
alter table public.leads
  add column if not exists email           text,
  add column if not exists research        jsonb,     -- { resumen, gaps[], servicios_sugeridos[], fuentes[], instagram }
  add column if not exists email_asunto    text,
  add column if not exists email_cuerpo    text,
  add column if not exists mensaje_corto   text,      -- versión WSP/IG (el `opener` queda como fallback histórico)
  add column if not exists research_at     timestamptz,
  add column if not exists email_enviado_at timestamptz,
  add column if not exists research_error  text;      -- si falló la síntesis, queda registrado

-- Ampliar la máquina de estados con 'investigado'
alter table public.leads drop constraint if exists leads_estado_check;
alter table public.leads add constraint leads_estado_check
  check (estado in (
    'prospecto_pendiente','investigado','aprobado','contactado','respondio',
    'diagnostico','propuesta','ganado','descartado'
  ));
```

Tipos en `types/database.ts` se actualizan en consecuencia (Row/Insert/Update).

## 6. Workflow `WF-SDR-Agent` (n8n)

Nodos (pipeline determinista, HTTP Request en typeVersion 4.2):

1. **Webhook** (POST `/webhook/sdr-agent`, responseMode onReceived) — body `{ lead_ids }`.
2. **Split lead_ids** (Code) → un item por id.
3. **Get Lead** (Supabase get by id). Filtra: solo procesa `estado ∈ {prospecto_pendiente, aprobado}`; el resto se saltea (IF).
4. **Scrape Web** (HTTP GET a `lead.web`, `onError: continueRegularOutput`, timeout corto, `alwaysOutputData`). Code posterior extrae: emails (regex), link de Instagram (regex `instagram.com/...`), y un excerpt de texto (primeros ~2-3k chars).
5. **Place Reviews** (HTTP POST Place Details con FieldMask `reviews`, `onError: continue`). Code extrae 3-5 reseñas recientes (texto + rating).
6. **Síntesis** (HTTP POST OpenAI `gpt-4o`, `response_format: json_object`, retryOnFail). Devuelve el JSON estructurado (ver §7).
7. **Cap Check** (Supabase count `email_enviado_at::date = current_date`) + Code → `puede_enviar = (email != null) && (count < TOPE)`. TOPE configurable (default 30).
8. **IF enviar** →
   - **true:** **Gmail Send** (nodo Gmail, credencial OAuth2 de Zecamo) → setea `email_enviado_at`, `estado='contactado'`, `fecha_contacto`.
   - **false:** marca `estado='investigado'`.
9. **Update Lead** (Supabase update by id) con: email, research (jsonb), email_asunto, email_cuerpo, mensaje_corto, research_at, estado, (email_enviado_at). Si la síntesis falló: `research_error` + estado vuelve a `prospecto_pendiente`.

Reusa credenciales existentes (OpenAI, Supabase, Places). **Nuevo:** credencial Gmail OAuth2 (setup manual de Joaco, una vez).

## 7. Contrato del LLM (síntesis)

**System (resumen):** Analista de prospección de Zecamo. Recibís research de un
negocio. Detectá huecos digitales y proponé 2-3 servicios concretos de Zecamo que
los resuelvan. Tono rioplatense, cercano, sin jerga, sin precios; primer contacto =
abrir conversación y ofrecer diagnóstico gratis.

**Input (user):** `{ nombre, categoria, zona, rating, num_reviews, web_texto,
instagram, reseñas[] }`.

**Output (JSON estricto):**
```json
{
  "research_resumen": "string (2-3 frases)",
  "gaps": ["string", "..."],
  "servicios_sugeridos": ["string (del catálogo Zecamo)", "..."],
  "email": "string | null  (email detectado en la web, o null)",
  "email_asunto": "string",
  "email_cuerpo": "string (rioplatense, con las 2-3 mejoras concretas)",
  "mensaje_corto": "string (1-3 frases para WSP/IG)"
}
```
El `email` lo decide el código del scrape (regex), no el LLM; si el LLM lo repite,
gana el del scrape. `servicios_sugeridos` se guarda dentro de `research`.

## 8. Cambios en el dashboard

- **`app/api/outbound/investigar/route.ts`** (nuevo, `requireAuth`): recibe
  `{ lead_ids }`, los reenvía al webhook `/webhook/sdr-agent` (URL hardcodeada con
  override por env, igual que `buscar/route.ts`).
- **`LeadsQueue.tsx`:**
  - Botón **"Investigar top N"** con selector de N (default 20). Toma los N
    primeros leads en `prospecto_pendiente` por score (los que todavía NO se
    investigaron), manda sus ids, espera y `router.refresh()`.
  - En cada card (cuando `estado ∈ {investigado, contactado}`): sección desplegable
    con **ficha** (research_resumen + gaps + chips servicios_sugeridos), **email**
    (asunto + cuerpo, botón copiar / badge "enviado" con `email_enviado_at`), y el
    **mensaje_corto**. El botón "Aprobar y abrir WhatsApp/IG" usa `mensaje_corto`
    (fallback `opener`).
  - Badges nuevos: `investigado` (violeta), `email enviado` (verde).
- **`lib/db/leads.ts`:** `getPendingLeads` pasa a traer estado ∈
  `{prospecto_pendiente, investigado}` (los dos se ven en la cola: sin investigar +
  investigados con borrador) e incluye las columnas nuevas. Un lead sale de la cola
  recién cuando pasa a `contactado` (email auto-enviado, o envío manual WSP/IG) o
  `descartado`. El "Investigar top N" filtra solo `prospecto_pendiente`.

## 9. Manejo de errores y bordes

| Caso | Comportamiento |
|---|---|
| Lead sin web | Sin email; research con reseñas + Google; `investigado` (borrador WSP/IG) |
| Web caída / timeout | `onError: continue`; se sigue con lo que haya |
| Place Details falla | `onError: continue`; research sin reseñas |
| LLM falla tras retries | `research_error` seteado, estado vuelve a `prospecto_pendiente` (no se pierde) |
| Sin email | `investigado`, borrador para manual |
| Tope diario alcanzado | email queda armado, NO se envía; `investigado`; lo agarra la próxima tanda |
| Re-procesar | Solo procesa `prospecto_pendiente`/`aprobado`; los `investigado`/`contactado` se saltean |
| Doble disparo | Idempotente por estado (un lead ya investigado no se reprocesa) |

## 10. Setup / dependencias nuevas

1. **Credencial Gmail OAuth2 en n8n** (cuenta Zecamo) — bloqueante para el envío.
2. **Migración 0012** aplicada en Supabase (`wlvogtjpldglpiufnryy`).
3. **TOPE diario** de emails como variable del workflow (default 30).

## 11. Fuera de alcance (YAGNI por ahora)

- Research social profundo con SerpAPI/Brave/Firecrawl (se usa el IG de la web).
- Envío automático por WhatsApp/Instagram (siempre manual).
- Cron automático (se decidió tandas manuales; el cron queda para más adelante).
- Seguimiento/secuencias multi-toque (follow-ups).
- Mini-auditoría tipo diagnóstico completo (research medio, no profundo).

## 12. Criterios de éxito

- Disparar una tanda de 20 leads y que cada uno quede con `research`, `gaps`,
  `servicios_sugeridos`, `email_asunto/cuerpo` y `mensaje_corto` en Supabase.
- Para leads con email y bajo el tope: mail **enviado** por Gmail, `estado=contactado`.
- Para el resto: `estado=investigado` con borrador visible en el dashboard.
- El dashboard muestra la ficha + el email + el mensaje corto y permite mandar a mano.
- Sin romper el WF-Outbound-SDR ni la cola actual.
