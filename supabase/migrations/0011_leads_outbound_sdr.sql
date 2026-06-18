-- ============================================================
-- 0011_leads_outbound_sdr.sql — Cola de prospección SDR (scraping + scoring)
-- Tope del embudo: gimnasios scrapeados de Google Places, puntuados por IA.
-- Cuando un lead responde se "promueve" al CRM (public.prospectos).
-- ============================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Identidad del negocio
  nombre text not null,
  categoria text default 'gimnasio',
  zona text,                         -- "San Miguel de Tucumán", "Yerba Buena", etc.
  google_place_id text unique,       -- clave de dedup

  -- Contacto
  telefono text,
  whatsapp text,                     -- normalizado a formato 549381...
  instagram text,                    -- handle si se encuentra
  web text,                          -- url o null

  -- Señales de Google
  rating numeric,
  num_reviews int,
  tiene_web boolean default false,

  -- Output del LLM
  score int,                         -- 1-10 (10 = más dolor / mejor prospecto)
  gancho text,                       -- el hueco detectado, en una frase
  opener text,                       -- primera línea generada
  canal_sugerido text,               -- 'instagram' | 'whatsapp'

  -- Estado (máquina del embudo SDR)
  estado text not null default 'prospecto_pendiente'
    check (estado in (
      'prospecto_pendiente','aprobado','contactado','respondio',
      'diagnostico','propuesta','ganado','descartado'
    )),

  aprobado_por text,
  fecha_contacto timestamptz,
  notas text
);

-- Índices para dedup y filtrado del Kanban
create index if not exists idx_leads_place_id on public.leads (google_place_id);
create index if not exists idx_leads_estado on public.leads (estado);

-- ──────────────────────────────────────────────
-- RLS (alineado al estilo de public.prospectos)
-- ──────────────────────────────────────────────
alter table public.leads enable row level security;

create policy "leads_select"
  on public.leads for select
  using (auth.uid() is not null);

create policy "leads_insert"
  on public.leads for insert
  with check (auth.uid() is not null);

create policy "leads_update"
  on public.leads for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "leads_delete"
  on public.leads for delete
  using (public.is_admin());
