-- ============================================================
-- 0006_manual_schema.sql — Tablas del Manual Operativo Zecamo
-- ============================================================

-- ──────────────────────────────────────────────
-- Enums
-- ──────────────────────────────────────────────
create type public.manual_block_type as enum (
  'text','callout','principle','team_member','service_line',
  'script','objection','playbook','pipeline_stage','pricing_floor','roadmap_month'
);
create type public.callout_variant as enum ('info','warn','danger','tip');

-- ──────────────────────────────────────────────
-- manual_sections
-- ──────────────────────────────────────────────
create table if not exists public.manual_sections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  lede        text,
  grp         text not null check (grp in ('operacion','negocio')),
  position    integer not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- principles
-- ──────────────────────────────────────────────
create table if not exists public.principles (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  title       text not null,
  body        text not null,
  position    integer not null,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- team_members
-- ──────────────────────────────────────────────
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,
  initial     text not null,
  role        text not null,
  bullets     text[] not null default '{}',
  position    integer not null,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- service_lines_config
-- ──────────────────────────────────────────────
create table if not exists public.service_lines_config (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  title           text not null,
  subtitle        text not null,
  description     text,
  badge_label     text not null,
  currency        text not null default 'USD',
  ticket_label    text not null,
  ticket_sublabel text,
  modelo_label    text not null,
  modelo_sublabel text,
  tiempo_label    text not null,
  tiempo_sublabel text,
  what_in         text[] not null default '{}',
  what_out        text[] not null default '{}',
  ideal_client    text[] not null default '{}',
  reject_client   text[] not null default '{}',
  position        integer not null,
  created_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- scripts
-- ──────────────────────────────────────────────
create table if not exists public.scripts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  steps       jsonb not null default '[]',
  closing     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- pipeline_stages
-- ──────────────────────────────────────────────
create table if not exists public.pipeline_stages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  subtitle    text,
  description text not null,
  action      text,
  owner_label text,
  sla         text,
  position    integer not null,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- pricing_floors
-- ──────────────────────────────────────────────
create table if not exists public.pricing_floors (
  id              uuid primary key default gen_random_uuid(),
  line_code       text not null,
  label           text not null,
  amount          integer not null,
  currency        text not null default 'USD',
  period          text not null,
  sublabel        text,
  floor_amount    integer not null,
  floor_note      text,
  position        integer not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- commission_rules
-- ──────────────────────────────────────────────
create table if not exists public.commission_rules (
  id              uuid primary key default gen_random_uuid(),
  client_type     text not null,
  basis           text not null,
  range_min       integer,
  range_max       integer,
  when_to_apply   text not null,
  position        integer not null,
  created_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- playbooks
-- ──────────────────────────────────────────────
create table if not exists public.playbooks (
  id          uuid primary key,
  line_code   text not null,
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- playbook_steps
-- ──────────────────────────────────────────────
create table if not exists public.playbook_steps (
  id          uuid primary key default gen_random_uuid(),
  playbook_id uuid not null references public.playbooks(id) on delete cascade,
  position    integer not null,
  title       text not null,
  description text not null,
  timing      text,
  badge_type  text not null default 'blue',
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- roadmap_months
-- ──────────────────────────────────────────────
create table if not exists public.roadmap_months (
  id          uuid primary key default gen_random_uuid(),
  month_num   integer unique not null,
  label       text not null,
  title       text not null,
  bullets     text[] not null default '{}',
  target_mrr  text not null,
  target_clients text not null,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- manual_blocks
-- ──────────────────────────────────────────────
create table if not exists public.manual_blocks (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.manual_sections(id) on delete cascade,
  type        public.manual_block_type not null,
  position    integer not null,
  content     jsonb,
  ref_id      uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────
create index if not exists manual_blocks_section_id_idx on public.manual_blocks(section_id, position);
create index if not exists playbook_steps_playbook_id_idx on public.playbook_steps(playbook_id, position);

-- ──────────────────────────────────────────────
-- updated_at trigger
-- ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger manual_sections_updated_at before update on public.manual_sections
  for each row execute function public.set_updated_at();
create trigger manual_blocks_updated_at before update on public.manual_blocks
  for each row execute function public.set_updated_at();
create trigger scripts_updated_at before update on public.scripts
  for each row execute function public.set_updated_at();
create trigger pricing_floors_updated_at before update on public.pricing_floors
  for each row execute function public.set_updated_at();
create trigger playbooks_updated_at before update on public.playbooks
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────
-- RLS
-- ──────────────────────────────────────────────
alter table public.manual_sections      enable row level security;
alter table public.principles           enable row level security;
alter table public.team_members         enable row level security;
alter table public.service_lines_config enable row level security;
alter table public.scripts              enable row level security;
alter table public.pipeline_stages      enable row level security;
alter table public.pricing_floors       enable row level security;
alter table public.commission_rules     enable row level security;
alter table public.playbooks            enable row level security;
alter table public.playbook_steps       enable row level security;
alter table public.roadmap_months       enable row level security;
alter table public.manual_blocks        enable row level security;

-- Lectura: cualquier usuario autenticado
create policy "manual_sections_select" on public.manual_sections for select using (auth.role() = 'authenticated');
create policy "principles_select"      on public.principles      for select using (auth.role() = 'authenticated');
create policy "team_members_select"    on public.team_members    for select using (auth.role() = 'authenticated');
create policy "service_lines_select"   on public.service_lines_config for select using (auth.role() = 'authenticated');
create policy "scripts_select"         on public.scripts         for select using (auth.role() = 'authenticated');
create policy "pipeline_stages_select" on public.pipeline_stages for select using (auth.role() = 'authenticated');
create policy "pricing_floors_select"  on public.pricing_floors  for select using (auth.role() = 'authenticated');
create policy "commission_rules_select" on public.commission_rules for select using (auth.role() = 'authenticated');
create policy "playbooks_select"       on public.playbooks       for select using (auth.role() = 'authenticated');
create policy "playbook_steps_select"  on public.playbook_steps  for select using (auth.role() = 'authenticated');
create policy "roadmap_months_select"  on public.roadmap_months  for select using (auth.role() = 'authenticated');
create policy "manual_blocks_select"   on public.manual_blocks   for select using (auth.role() = 'authenticated');

-- Escritura: solo owner/admin (Joaco)
create policy "manual_sections_write" on public.manual_sections for all using (public.is_admin()) with check (public.is_admin());
create policy "principles_write"      on public.principles      for all using (public.is_admin()) with check (public.is_admin());
create policy "team_members_write"    on public.team_members    for all using (public.is_admin()) with check (public.is_admin());
create policy "service_lines_write"   on public.service_lines_config for all using (public.is_admin()) with check (public.is_admin());
create policy "scripts_write"         on public.scripts         for all using (public.is_admin()) with check (public.is_admin());
create policy "pipeline_stages_write" on public.pipeline_stages for all using (public.is_admin()) with check (public.is_admin());
create policy "pricing_floors_write"  on public.pricing_floors  for all using (public.is_admin()) with check (public.is_admin());
create policy "commission_rules_write" on public.commission_rules for all using (public.is_admin()) with check (public.is_admin());
create policy "playbooks_write"       on public.playbooks       for all using (public.is_admin()) with check (public.is_admin());
create policy "playbook_steps_write"  on public.playbook_steps  for all using (public.is_admin()) with check (public.is_admin());
create policy "roadmap_months_write"  on public.roadmap_months  for all using (public.is_admin()) with check (public.is_admin());
create policy "manual_blocks_write"   on public.manual_blocks   for all using (public.is_admin()) with check (public.is_admin());
