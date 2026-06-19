-- ============================================================
-- 0012_leads_research_outreach.sql — research + outreach del WF-SDR-Agent
-- Aditiva sobre public.leads (no rompe 0011 ni WF-Outbound-SDR).
-- El agente investiga cada lead, arma email + mensaje y deja todo acá.
-- ============================================================
alter table public.leads
  add column if not exists email            text,
  add column if not exists research         jsonb,      -- { resumen, gaps[], servicios_sugeridos[], instagram, fuentes }
  add column if not exists email_asunto     text,
  add column if not exists email_cuerpo     text,
  add column if not exists mensaje_corto    text,       -- versión WSP/IG (el opener queda como fallback)
  add column if not exists research_at      timestamptz,
  add column if not exists email_enviado_at timestamptz,
  add column if not exists research_error   text;

-- Ampliar la máquina de estados con 'investigado'
alter table public.leads drop constraint if exists leads_estado_check;
alter table public.leads add constraint leads_estado_check
  check (estado in (
    'prospecto_pendiente','investigado','aprobado','contactado','respondio',
    'diagnostico','propuesta','ganado','descartado'
  ));

create index if not exists idx_leads_email_enviado_at on public.leads (email_enviado_at);
