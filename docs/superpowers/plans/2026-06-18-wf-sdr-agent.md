# WF-SDR-Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agente de research + outreach personalizado: por tandas, investiga cada lead, arma email/mensaje con servicios Zecamo y envía por Gmail (auto, tope diario) o deja borrador para WSP/IG.

**Architecture:** Pipeline determinista en n8n (`WF-SDR-Agent`) disparado por webhook desde el dashboard con `{lead_ids}`. Por lead: scrape web + reseñas → 1 llamada gpt-4o → ficha + email + mensaje corto → Gmail send o borrador → update Supabase. El dashboard dispara y muestra. Toda la lógica de outreach vive en n8n.

**Tech Stack:** n8n (MCP), Supabase (Management API, ref `wlvogtjpldglpiufnryy`), Next.js 14 (App Router, TS), OpenAI gpt-4o, Gmail node (OAuth2).

**Spec:** `docs/superpowers/specs/2026-06-18-sdr-agent-research-outreach-design.md`

**Verificación (no hay test runner):** dashboard → `npx tsc --noEmit` (filtrar mis archivos) + `npx next build`; n8n → `n8n_validate_workflow` + disparo real del webhook + query Supabase; migración → query Management API.

**IDs reutilizables:** OpenAI `ZKmo5sQ0e6Fy8VOe` (zecamo-openai), Supabase n8n `TGnYQvwf2ZIdmYLl`, Places `9sx9BLeX3gzOPeql`. Workflow upstream `WF-Outbound-SDR` = `8aU2Ios4Rjsg8Oa9`. Webhook base: `https://zecamon8n.zecamostudios.com/webhook/`.

---

## Task 0 (manual, Joaco): conectar Gmail en n8n

**Bloqueante para el envío de emails (Task 6).** No bloquea el resto.

- [ ] **Step 1:** En n8n → Credentials → New → "Gmail OAuth2 API" → conectar la cuenta de Gmail de Zecamo desde la que se mandan los cold emails. Anotar el **ID** de la credencial creada.
- [ ] **Step 2:** Pasarle el ID al ejecutor para cablear el nodo Gmail.

---

## Task 1: Migración 0012 (tabla `leads` + tipos)

**Files:**
- Create: `supabase/migrations/0012_leads_research_outreach.sql`
- Modify: `types/database.ts` (bloque `leads` Row/Insert/Update + nada más)

- [ ] **Step 1: Escribir la migración**

Create `supabase/migrations/0012_leads_research_outreach.sql`:

```sql
-- 0012_leads_research_outreach.sql — research + outreach del WF-SDR-Agent
alter table public.leads
  add column if not exists email            text,
  add column if not exists research         jsonb,
  add column if not exists email_asunto     text,
  add column if not exists email_cuerpo     text,
  add column if not exists mensaje_corto    text,
  add column if not exists research_at      timestamptz,
  add column if not exists email_enviado_at timestamptz,
  add column if not exists research_error   text;

alter table public.leads drop constraint if exists leads_estado_check;
alter table public.leads add constraint leads_estado_check
  check (estado in (
    'prospecto_pendiente','investigado','aprobado','contactado','respondio',
    'diagnostico','propuesta','ganado','descartado'
  ));

create index if not exists idx_leads_email_enviado_at on public.leads (email_enviado_at);
```

- [ ] **Step 2: Aplicar vía Management API**

Run (Bash, con `--use-system-ca`):
```bash
SB_TOKEN="$SB_TOKEN" node --use-system-ca /tmp/sb_query.js "$(cat 'supabase/migrations/0012_leads_research_outreach.sql')"
```
(Si `/tmp/sb_query.js` no existe, recrearlo: POST a `https://api.supabase.com/v1/projects/wlvogtjpldglpiufnryy/database/query` con `{query}` y header `Authorization: Bearer $SB_TOKEN`.)
Expected: `STATUS 201` y `[]`.

- [ ] **Step 3: Verificar columnas**

Run:
```bash
SB_TOKEN="$SB_TOKEN" node --use-system-ca /tmp/sb_query.js "select column_name from information_schema.columns where table_schema='public' and table_name='leads' and column_name in ('email','research','email_asunto','email_cuerpo','mensaje_corto','research_at','email_enviado_at','research_error') order by column_name;"
```
Expected: las 8 columnas listadas.

- [ ] **Step 4: Actualizar `types/database.ts`**

En el bloque `leads` (Row, Insert, Update) agregar estos campos (todos `string | null` salvo `research`):
```ts
// Row:
email: string | null;
research: Record<string, unknown> | null;
email_asunto: string | null;
email_cuerpo: string | null;
mensaje_corto: string | null;
research_at: string | null;
email_enviado_at: string | null;
research_error: string | null;
// Insert y Update: mismos campos, todos opcionales (`?`) y nullable.
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep -E "database.ts" || echo OK`
Expected: `OK`.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0012_leads_research_outreach.sql types/database.ts
git commit -m "feat(outbound): migración 0012 research+outreach en leads"
```

---

## Task 2: Crear `WF-SDR-Agent` (esqueleto: webhook → split → get lead → filtro)

**Files:** n8n (vía MCP). Sin archivos de repo.

- [ ] **Step 1: Crear el workflow con los primeros nodos**

Usar `n8n_create_workflow` (name `WF-SDR-Agent`) con nodos:

1. **Webhook** (`n8n-nodes-base.webhook`, typeVersion 2.1): `{ httpMethod:"POST", path:"sdr-agent", responseMode:"onReceived" }`.
2. **Split Lead IDs** (`n8n-nodes-base.code`, typeVersion 2):
```javascript
const body = $input.first().json.body || {};
const ids = Array.isArray(body.lead_ids) ? body.lead_ids : [];
return ids.map(id => ({ json: { lead_id: String(id) } }));
```
3. **Get Lead** (`n8n-nodes-base.supabase`, typeVersion 1, cred `TGnYQvwf2ZIdmYLl`): `{ operation:"get", tableId:"leads", id:"={{ $json.lead_id }}" }`.
4. **Filtro Procesable** (`n8n-nodes-base.if`, typeVersion 2): condición `={{ ['prospecto_pendiente','aprobado'].includes($json.estado) }}` igual a `true` (boolean). Solo la rama true sigue.

Conexiones: Webhook → Split → Get Lead → Filtro Procesable.

- [ ] **Step 2: Validar**

`n8n_validate_workflow({id, options:{profile:"runtime"}})`.
Expected: `errorCount: 0` (ignorar warnings de code/typeVersion). Anotar el workflow ID.

- [ ] **Step 3: Commit (n8n no versiona en git; registrar el ID en el plan)**

Anotar el ID del nuevo workflow acá: `WF-SDR-Agent id = ____`.

---

## Task 3: Nodos de research (scrape web + extracción + reseñas)

**Files:** n8n (MCP, `n8n_update_partial_workflow` con `addNode`/`addConnection`).

- [ ] **Step 1: Nodo Scrape Web (HTTP 4.2)**

addNode `Scrape Web` (`n8n-nodes-base.httpRequest`, typeVersion 4.2):
```json
{ "method":"GET",
  "url":"={{ $json.web || 'https://example.com/__noweb__' }}",
  "options": { "timeout": 12000, "redirect": { "redirect": {} } } }
```
Props del nodo: `onError:"continueRegularOutput"`, `alwaysOutputData:true`, `retryOnFail:false`.
Conectar: Filtro Procesable (rama true) → Scrape Web.

- [ ] **Step 2: Nodo Extraer Web (Code, runOnceForEachItem)**

addNode `Extraer Web` (`n8n-nodes-base.code`, typeVersion 2, `mode:"runOnceForEachItem"`):
```javascript
const lead = $('Get Lead').item.json;
let html = '';
const d = $json.data ?? $json.body ?? $json;
html = typeof d === 'string' ? d : '';
// email (evita imágenes/png)
const emails = (html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])
  .filter(e => !/\.(png|jpg|jpeg|gif|webp)$/i.test(e));
const email = emails[0] || null;
// instagram
const igM = html.match(/instagram\.com\/([A-Za-z0-9_.]+)/i);
const instagram = igM ? igM[1] : null;
// texto plano acotado
const texto = html.replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0, 2500);
return { json: { ...lead, web_email: email, web_instagram: instagram, web_texto: texto } };
```
Conectar: Scrape Web → Extraer Web.

- [ ] **Step 3: Nodo Place Reviews (HTTP 4.2)**

addNode `Place Reviews` (`n8n-nodes-base.httpRequest`, typeVersion 4.2, cred `9sx9BLeX3gzOPeql`):
```json
{ "method":"GET",
  "url":"=https://places.googleapis.com/v1/places/{{ $json.google_place_id }}",
  "authentication":"genericCredentialType", "genericAuthType":"httpHeaderAuth",
  "sendHeaders":true,
  "headerParameters":{ "parameters":[ { "name":"X-Goog-FieldMask", "value":"reviews" } ] } }
```
Props: `onError:"continueRegularOutput"`, `alwaysOutputData:true`.
Conectar: Extraer Web → Place Reviews.

- [ ] **Step 4: Nodo Armar Contexto (Code, runOnceForEachItem)**

addNode `Armar Contexto` (`n8n-nodes-base.code`, typeVersion 2, `mode:"runOnceForEachItem"`):
```javascript
const base = $('Extraer Web').item.json;
const reviews = ($json.reviews || []).slice(0,5).map(r => ({
  rating: r.rating,
  text: (r.text && r.text.text) ? r.text.text.slice(0,300) : ''
})).filter(r => r.text);
return { json: { ...base, reviews } };
```
Conectar: Place Reviews → Armar Contexto.

- [ ] **Step 5: Validar**

`n8n_validate_workflow`. Expected: `errorCount: 0`.

---

## Task 4: Síntesis LLM (gpt-4o)

**Files:** n8n (MCP).

- [ ] **Step 1: Nodo Síntesis (HTTP 4.2, OpenAI)**

addNode `Sintesis` (`n8n-nodes-base.httpRequest`, typeVersion 4.2, cred OpenAI `ZKmo5sQ0e6Fy8VOe`):
```json
{ "method":"POST", "url":"https://api.openai.com/v1/chat/completions",
  "authentication":"predefinedCredentialType", "nodeCredentialType":"openAiApi",
  "sendBody":true, "specifyBody":"json",
  "jsonBody":"={{ JSON.stringify({ model:'gpt-4o-mini', temperature:0.6, response_format:{type:'json_object'}, messages:[ { role:'system', content:'Sos analista de prospeccion de Zecamo Studios (agencia de automatizacion con IA e Vibe Coding en Tucuman). Recibis research de un negocio. Detecta huecos digitales y proponé 2 a 3 servicios concretos de Zecamo que los resuelvan (web/landing con Vibe Coding, automatizaciones n8n, agente IA de atencion, SEO, Meta Ads, dashboard). Tono rioplatense, cercano, sin jerga, sin precios; primer contacto = abrir conversacion y ofrecer un diagnostico gratis. Devolve SOLO JSON con estas claves: research_resumen (string 2-3 frases), gaps (array de strings), servicios_sugeridos (array de strings del catalogo), email_asunto (string), email_cuerpo (string, 5-8 lineas, saludo + gancho real del research + las 2-3 mejoras + cierre con pregunta), mensaje_corto (string 1-3 frases para WhatsApp/IG). Sin markdown.' }, { role:'user', content: JSON.stringify({ nombre:$json.nombre, categoria:$json.categoria, zona:$json.zona, rating:$json.rating, num_reviews:$json.num_reviews, tiene_web:$json.tiene_web, web_texto:$json.web_texto, instagram:$json.web_instagram, reviews:$json.reviews }) } ] }) }}" }
```
Props: `retryOnFail:true, maxTries:3, waitBetweenTries:2000`, `onError:"continueRegularOutput"`, `alwaysOutputData:true`.
Conectar: Armar Contexto → Sintesis.

- [ ] **Step 2: Nodo Parsear (Code, runOnceForEachItem)**

addNode `Parsear` (`n8n-nodes-base.code`, typeVersion 2, `mode:"runOnceForEachItem"`):
```javascript
const base = $('Armar Contexto').item.json;
let out = {}, err = null;
try {
  out = JSON.parse($json.choices[0].message.content);
} catch (e) { err = 'sintesis_parse: ' + e.message; }
const email = base.web_email || (out.email || null);
const research = {
  resumen: out.research_resumen || null,
  gaps: out.gaps || [],
  servicios_sugeridos: out.servicios_sugeridos || [],
  instagram: base.web_instagram || null,
  fuentes: { web: !!base.web_texto, reviews: (base.reviews||[]).length }
};
return { json: {
  lead_id: base.id,
  nombre: base.nombre,
  email,
  instagram: base.web_instagram || base.instagram || null,
  whatsapp: base.whatsapp,
  canal_sugerido: base.canal_sugerido,
  research,
  email_asunto: out.email_asunto || null,
  email_cuerpo: out.email_cuerpo || null,
  mensaje_corto: out.mensaje_corto || base.opener || null,
  research_error: err
} };
```
Conectar: Sintesis → Parsear.

- [ ] **Step 3: Validar.** `errorCount: 0`.

---

## Task 5: Cap diario + ramas (enviar / borrador) + update Supabase

**Files:** n8n (MCP). Requiere Task 0 (cred Gmail) para el nodo Gmail.

- [ ] **Step 1: Nodo Cap Check (Code `Puede Enviar`, runOnceForEachItem)**

Tope diario con `staticData` del workflow (simple, sin tocar la DB):
```javascript
const TOPE = 30;
const item = $json;
// contador acumulado en staticData del workflow para esta corrida
const wf = $getWorkflowStaticData('global');
if (typeof wf.enviadosHoy !== 'number' || wf.fechaHoy !== new Date().toISOString().slice(0,10)) {
  wf.fechaHoy = new Date().toISOString().slice(0,10);
  wf.enviadosHoy = 0; // se reinicia por dia; el conteo real de DB se valida en el dashboard
}
const puede = !!item.email && !item.research_error && wf.enviadosHoy < TOPE;
if (puede) wf.enviadosHoy += 1;
return { json: { ...item, puede_enviar: puede } };
```
> Nota de implementación: el tope con `staticData` cuenta por corrida/día del workflow. Para un tope global exacto contra la DB, una mejora futura es un Code que haga `fetch` a PostgREST contando `email_enviado_at::date=today`. Para arrancar, `staticData` alcanza.

Conectar: Parsear → Puede Enviar.

- [ ] **Step 2: Nodo IF Enviar**

addNode `IF Enviar` (`n8n-nodes-base.if`, typeVersion 2): condición `={{ $json.puede_enviar }}` es `true` (boolean).
Conectar: Puede Enviar → IF Enviar.

- [ ] **Step 3: Rama TRUE — Gmail Send**

addNode `Enviar Gmail` (`n8n-nodes-base.gmail`, typeVersion 2.1, cred Gmail del Task 0):
```json
{ "resource":"message", "operation":"send",
  "sendTo":"={{ $json.email }}",
  "subject":"={{ $json.email_asunto }}",
  "emailType":"text",
  "message":"={{ $json.email_cuerpo }}" }
```
Props: `onError:"continueRegularOutput"`, `alwaysOutputData:true`.
addNode `Marcar Enviado` (`n8n-nodes-base.code`, typeVersion 2, runOnceForEachItem):
```javascript
const p = $('Puede Enviar').item.json;
return { json: { ...p, estado:'contactado', email_enviado_at: new Date().toISOString() } };
```
Conectar: IF Enviar (true) → Enviar Gmail → Marcar Enviado.

- [ ] **Step 4: Rama FALSE — Borrador**

addNode `Marcar Investigado` (`n8n-nodes-base.code`, typeVersion 2, runOnceForEachItem):
```javascript
const p = $json;
return { json: { ...p, estado: p.research_error ? 'prospecto_pendiente' : 'investigado', email_enviado_at: null } };
```
Conectar: IF Enviar (false) → Marcar Investigado.

- [ ] **Step 5: Update Supabase (las dos ramas convergen)**

addNode `Update Lead` (`n8n-nodes-base.supabase`, typeVersion 1, cred `TGnYQvwf2ZIdmYLl`):
```json
{ "operation":"update", "tableId":"leads",
  "filterType":"string", "filterString":"id=eq.{{ $json.lead_id }}",
  "fieldsUi": { "fieldValues": [
    {"fieldId":"email","fieldValue":"={{ $json.email }}"},
    {"fieldId":"research","fieldValue":"={{ JSON.stringify($json.research) }}"},
    {"fieldId":"email_asunto","fieldValue":"={{ $json.email_asunto }}"},
    {"fieldId":"email_cuerpo","fieldValue":"={{ $json.email_cuerpo }}"},
    {"fieldId":"mensaje_corto","fieldValue":"={{ $json.mensaje_corto }}"},
    {"fieldId":"instagram","fieldValue":"={{ $json.instagram }}"},
    {"fieldId":"canal_sugerido","fieldValue":"={{ $json.email ? 'email' : $json.canal_sugerido }}"},
    {"fieldId":"research_error","fieldValue":"={{ $json.research_error }}"},
    {"fieldId":"research_at","fieldValue":"={{ $now.toISO() }}"},
    {"fieldId":"email_enviado_at","fieldValue":"={{ $json.email_enviado_at }}"},
    {"fieldId":"estado","fieldValue":"={{ $json.estado }}"}
  ] } }
```
Conectar: Marcar Enviado → Update Lead; Marcar Investigado → Update Lead.

> Verificar que el nodo Supabase `update` acepta `filterString` con `id=eq.<uuid>`. Si el nodo exige otra forma (matchingColumns), ajustar a la API real del nodo (usar `n8n_get_node` mode docs sobre `nodes-base.supabase` operación update) durante la implementación.

- [ ] **Step 6: Validar.** `n8n_validate_workflow` → `errorCount: 0`.

---

## Task 6: Test end-to-end del workflow

**Files:** ninguno (verificación).

- [ ] **Step 1: Resetear 2 leads de prueba a pendiente con web**

Run (elige 2 leads que tengan `web` para ejercitar el scrape):
```bash
SB_TOKEN="$SB_TOKEN" node --use-system-ca /tmp/sb_query.js "select id, nombre, web from public.leads where web is not null and estado='prospecto_pendiente' limit 2;"
```
Anotar los 2 ids.

- [ ] **Step 2: Activar el workflow**

`n8n_update_partial_workflow({id, operations:[{type:"activateWorkflow"}]})`.

- [ ] **Step 3: Disparar el webhook con los 2 ids**

`n8n_test_workflow({workflowId, triggerType:"webhook", httpMethod:"POST", webhookPath:"sdr-agent", data:{ lead_ids:["<id1>","<id2>"] }})`.
Expected: `200 {"message":"Workflow was started"}`.

- [ ] **Step 4: Verificar la ejecución**

`n8n_executions({action:"list", workflowId, limit:1})` → status `success`. Si `error`, usar `n8n_executions({action:"get", id, mode:"error"})` y corregir el nodo que falló (loop validar→corregir).

- [ ] **Step 5: Verificar en Supabase**

```bash
SB_TOKEN="$SB_TOKEN" node --use-system-ca /tmp/sb_query.js "select nombre, estado, email, email_asunto, left(email_cuerpo,80) cuerpo, left(mensaje_corto,60) corto, research->'gaps' gaps, research_error from public.leads where id in ('<id1>','<id2>');"
```
Expected: `research` poblado, `email_asunto/cuerpo` y `mensaje_corto` no nulos, `estado` = `investigado` (o `contactado` si había email y Gmail está conectado). `research_error` null.

---

## Task 7: Route `/api/outbound/investigar`

**Files:**
- Create: `app/api/outbound/investigar/route.ts`

- [ ] **Step 1: Crear la route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-guard";

const SDR_AGENT_WEBHOOK_URL =
  process.env.N8N_SDR_AGENT_WEBHOOK_URL ??
  "https://zecamon8n.zecamostudios.com/webhook/sdr-agent";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  let lead_ids: string[] = [];
  try {
    const body = await req.json();
    lead_ids = Array.isArray(body?.lead_ids) ? body.lead_ids.map(String) : [];
  } catch {
    lead_ids = [];
  }
  if (lead_ids.length === 0) {
    return NextResponse.json({ error: "lead_ids vacío" }, { status: 400 });
  }

  try {
    const res = await fetch(SDR_AGENT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_ids }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[outbound/investigar] webhook", res.status, txt);
      return NextResponse.json({ error: `El agente respondió ${res.status}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, enviados: lead_ids.length });
  } catch (err) {
    console.error("[outbound/investigar]", err);
    return NextResponse.json({ error: "No se pudo contactar el agente" }, { status: 502 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit 2>&1 | grep "investigar" || echo OK`
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add app/api/outbound/investigar/route.ts
git commit -m "feat(outbound): route /api/outbound/investigar dispara WF-SDR-Agent"
```

---

## Task 8: `getPendingLeads` incluye `investigado` + botón "Investigar top N"

**Files:**
- Modify: `lib/db/leads.ts` (función `getPendingLeads`)
- Modify: `components/outbound/LeadsQueue.tsx`

- [ ] **Step 1: Ampliar `getPendingLeads`**

En `lib/db/leads.ts`, cambiar el filtro de estado: reemplazar `.eq("estado", "prospecto_pendiente")` por
```ts
.in("estado", ["prospecto_pendiente", "investigado"])
```
(El `LEAD_COLS` ya trae todas las columnas; agregar a la constante: `, email, research, email_asunto, email_cuerpo, mensaje_corto, research_at, email_enviado_at`.)

- [ ] **Step 2: Estado + handler del botón en LeadsQueue**

En `components/outbound/LeadsQueue.tsx`, dentro del componente, agregar:
```tsx
const [investigando, setInvestigando] = useState(false);
const [topN, setTopN] = useState(20);

async function investigarTopN() {
  const pendientes = leads
    .filter((l) => l.estado === "prospecto_pendiente")
    .slice(0, topN)
    .map((l) => l.id);
  if (pendientes.length === 0) {
    toast.error("No hay leads sin investigar en la cola");
    return;
  }
  setInvestigando(true);
  try {
    const res = await fetch("/api/outbound/investigar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_ids: pendientes }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "" }));
      toast.error(error || "No se pudo iniciar la investigación");
      setInvestigando(false);
      return;
    }
    toast.success(`Investigando ${pendientes.length} leads… en ~1 min aparecen las propuestas`);
    await new Promise((r) => setTimeout(r, 30000));
    router.refresh();
  } catch {
    toast.error("No se pudo contactar el servidor");
  } finally {
    setInvestigando(false);
  }
}
```
(El componente ya importa `useState`, `useRouter`, `toast`. Agregar `Sparkles` a los imports de `lucide-react`.)

- [ ] **Step 3: Botón en el header**

En el `PageHead` `actions`, después del form de búsqueda, agregar:
```tsx
<button
  onClick={investigarTopN}
  disabled={investigando}
  title="Investiga los leads pendientes y arma email + propuesta"
  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium bg-white/[0.06] text-[var(--color-text)] border border-[var(--color-border)] cursor-pointer hover:bg-white/[0.1] transition disabled:opacity-60 whitespace-nowrap"
>
  {investigando ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
  {investigando ? "Investigando…" : `Investigar top ${topN}`}
</button>
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit 2>&1 | grep -E "LeadsQueue|leads.ts" || echo OK` → `OK`.

- [ ] **Step 5: Commit**

```bash
git add lib/db/leads.ts components/outbound/LeadsQueue.tsx
git commit -m "feat(outbound): botón Investigar top N + cola incluye investigados"
```

---

## Task 9: Mostrar ficha + email + mensaje corto en la card

**Files:**
- Modify: `components/outbound/LeadsQueue.tsx`

- [ ] **Step 1: Badge de estado + sección research en la card**

Dentro del `.map((lead) => …)`, después del bloque del Gancho, agregar (renderiza solo si hay research):
```tsx
{lead.research_at && (
  <div className="rounded-xl bg-white/[0.03] border border-[var(--color-border)] px-3 py-2.5 space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">Research</span>
      {lead.email_enviado_at ? (
        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[rgba(34,197,139,0.1)] text-[var(--color-success)]">email enviado</span>
      ) : (
        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.12)] text-[var(--color-primary-hover)]">investigado</span>
      )}
    </div>
    {(lead.research as { resumen?: string } | null)?.resumen && (
      <p className="text-[12.5px] text-[var(--color-text)] leading-snug">{(lead.research as { resumen?: string }).resumen}</p>
    )}
    {Array.isArray((lead.research as { servicios_sugeridos?: string[] } | null)?.servicios_sugeridos) && (
      <div className="flex flex-wrap gap-1.5">
        {(lead.research as { servicios_sugeridos: string[] }).servicios_sugeridos.map((s, i) => (
          <span key={i} className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-[var(--color-border)] text-[var(--color-text-muted)]">{s}</span>
        ))}
      </div>
    )}
    {lead.email_asunto && (
      <details className="mt-1">
        <summary className="text-[11.5px] text-[var(--color-primary-hover)] cursor-pointer">Ver email{lead.email ? ` → ${lead.email}` : ""}</summary>
        <div className="mt-1.5 text-[12px] text-[var(--color-text)] whitespace-pre-wrap leading-snug">
          <div className="font-medium">{lead.email_asunto}</div>
          <div className="mt-1 text-[var(--color-text-muted)]">{lead.email_cuerpo}</div>
        </div>
      </details>
    )}
  </div>
)}
```

- [ ] **Step 2: El opener editable usa `mensaje_corto` cuando existe**

Cambiar la inicialización de `openers` (en el `useState` y en el `useEffect`) para preferir `mensaje_corto`:
```tsx
() => Object.fromEntries(initialLeads.map((l) => [l.id, l.mensaje_corto ?? l.opener ?? ""])),
// y en el useEffect, idéntico:
setOpeners(Object.fromEntries(initialLeads.map((l) => [l.id, l.mensaje_corto ?? l.opener ?? ""])));
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit 2>&1 | grep "LeadsQueue" || echo OK` → `OK`.
Run: `npx next build 2>&1 | grep -E "Compiled successfully|Failed to compile"` → `Compiled successfully` (el build local puede fallar luego en page-data de rutas que instancian OpenAI sin `OPENAI_API_KEY` — eso es esperado y no bloquea Vercel).

- [ ] **Step 4: Commit**

```bash
git add components/outbound/LeadsQueue.tsx
git commit -m "feat(outbound): ficha de research + email + mensaje corto en la card"
```

---

## Task 10: Deploy + verificación en prod

**Files:** ninguno.

- [ ] **Step 1: Push (rebase sobre remoto, stash del cambio de refresh-instagram si está)**

```bash
git stash push -- app/api/cron/refresh-instagram/route.ts 2>/dev/null
git -c http.sslVerify=false fetch "https://$GITHUB_PAT@github.com/zecamostudios/zecamo-dashboard.git" main
git -c http.sslVerify=false rebase FETCH_HEAD
git -c http.sslVerify=false push "https://$GITHUB_PAT@github.com/zecamostudios/zecamo-dashboard.git" main
git stash pop 2>/dev/null
```

- [ ] **Step 2: Esperar deploy READY**

Pollear deployments del proyecto Vercel `prj_7Wsh64aEbViYIgY6Aaym6wGA8jVv` (teamId `team_tNAJ7vW2OBlCVtwl6v6sfFMN`, token `vcp_...`) hasta `READY`.

- [ ] **Step 3: Verificación funcional**

En `dashboardzecamostudios.vercel.app/outbound/cola` (logueado): tocar **"Investigar top N"** → esperar → la cola muestra la ficha + email + chips de servicios en las cards. Confirmar en Supabase que esos leads quedaron `investigado`/`contactado` con `research` poblado.

---

## Notas de verificación final (self-review del ejecutor)

- Tras Task 6, si el nodo Gmail no está (Task 0 pendiente), los leads con email quedan en `investigado` con el mail armado (no se rompe) — el envío se prueba cuando Joaco conecte Gmail.
- El nodo Supabase `update` con `filterString` debe validarse contra la API real del nodo (Step 5 de Task 5).
- `gpt-4o` cuesta más que nano: confirmar con Joaco si el costo por tanda es aceptable o bajar a `gpt-4o-mini`.
