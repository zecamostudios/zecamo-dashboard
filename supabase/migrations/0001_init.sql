-- ============================================================
-- 0001_init.sql — Tablas principales de Zecamo Dashboard
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  nombre      text,
  rol         text not null default 'member' check (rol in ('owner','admin','member')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Trigger: crear perfil automáticamente al registrar usuario.
-- El primer usuario queda como 'owner'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_count int;
begin
  select count(*) into user_count from public.profiles;
  insert into public.profiles (id, email, rol)
  values (
    new.id,
    new.email,
    case when user_count = 0 then 'owner' else 'member' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ──────────────────────────────────────────────
-- clientes (va antes que prospectos/pricing/proyectos)
-- ──────────────────────────────────────────────
create table if not exists public.clientes (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  contacto_nombre text,
  contacto_email  text,
  contacto_tel    text,
  fecha_inicio    date,
  mrr_usd         numeric not null default 0,
  estado          text not null default 'activo' check (estado in ('activo','pausado','churn')),
  notas           text,
  created_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- prospectos
-- ──────────────────────────────────────────────
create table if not exists public.prospectos (
  id                uuid primary key default gen_random_uuid(),
  negocio           text not null,
  nombre_dueno      text,
  nombre_portero    text,
  telefono          text,
  email             text,
  fuente            text,
  fecha_contacto    date,
  volver_a_llamar   text,
  estado            text not null default 'initiated'
    check (estado in ('initiated','engaged','calendly','booked','no_interesado','agendado')),
  notas             text,
  asignado_a        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- interacciones_prospecto (timeline CRM)
-- ──────────────────────────────────────────────
create table if not exists public.interacciones_prospecto (
  id            uuid primary key default gen_random_uuid(),
  prospecto_id  uuid not null references public.prospectos(id) on delete cascade,
  tipo          text not null,
  contenido     text,
  fecha         timestamptz not null default now(),
  creado_por    uuid references public.profiles(id) on delete set null
);

-- ──────────────────────────────────────────────
-- pricing_calculos
-- ──────────────────────────────────────────────
create table if not exists public.pricing_calculos (
  id                          uuid primary key default gen_random_uuid(),
  nombre_solucion             text not null,
  area                        text,
  descripcion                 text,
  cliente_id                  uuid references public.clientes(id) on delete set null,
  prospecto_id                uuid references public.prospectos(id) on delete set null,

  -- Inputs
  impacto                     numeric,
  esfuerzo                    numeric,
  horas_semana_tarea          numeric,
  personas_afectadas          numeric,
  pct_tiempo_ahorrado         numeric,
  sueldo_mensual_empleado_usd numeric,
  horas_semana_empleado       numeric,
  time_to_value_semanas       numeric,
  riesgo                      numeric,
  compliance_flag             boolean not null default false,
  fit_estrategico             numeric,

  horas_desarrollo            numeric,
  tarifa_hora_usd             numeric,
  costo_herramientas_mes_usd  numeric,
  costos_fijos_usd            numeric,

  -- Outputs calculados (cacheados)
  costo_hora_empleado_usd     numeric,
  ahorro_anual_usd            numeric,
  costo_impl_usd              numeric,
  valor_anual_cliente_usd     numeric,
  roi_pct                     numeric,
  roi_score                   numeric,
  esfuerzo_ajustado           numeric,
  score_final                 numeric,
  clasificacion               text,
  precio_minimo_usd           numeric,
  precio_recomendado_usd      numeric,
  precio_agresivo_usd         numeric,
  ganancia_neta_usd           numeric,
  margen_pct                  numeric,
  meses_payback_cliente       numeric,
  mensual_min_usd             numeric,
  mensual_ideal_usd           numeric,
  alerta_margen               text,
  alerta_pricing              text,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  creado_por                  uuid references public.profiles(id) on delete set null
);

-- ──────────────────────────────────────────────
-- proyectos
-- ──────────────────────────────────────────────
create table if not exists public.proyectos (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null references public.clientes(id) on delete cascade,
  nombre            text not null,
  descripcion       text,
  estado            text not null default 'propuesta'
    check (estado in ('propuesta','en_desarrollo','entregado','en_soporte','cancelado')),
  fecha_inicio      date,
  fecha_entrega     date,
  precio_total_usd  numeric,
  horas_estimadas   numeric,
  horas_reales      numeric not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- outbound_campanas
-- ──────────────────────────────────────────────
create table if not exists public.outbound_campanas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  canal         text,
  fecha_inicio  date,
  fecha_fin     date,
  notas         text,
  created_at    timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- outbound_envios
-- ──────────────────────────────────────────────
create table if not exists public.outbound_envios (
  id            uuid primary key default gen_random_uuid(),
  campana_id    uuid not null references public.outbound_campanas(id) on delete cascade,
  prospecto_id  uuid references public.prospectos(id) on delete set null,
  fecha         timestamptz not null default now(),
  estado        text,
  asunto        text,
  contenido     text
);

-- ──────────────────────────────────────────────
-- transacciones
-- ──────────────────────────────────────────────
create table if not exists public.transacciones (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null,
  tipo          text not null check (tipo in ('ingreso','egreso')),
  categoria     text,
  descripcion   text,
  monto_usd     numeric not null,
  cliente_id    uuid references public.clientes(id) on delete set null,
  proyecto_id   uuid references public.proyectos(id) on delete set null,
  metodo_pago   text,
  created_at    timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- tareas
-- ──────────────────────────────────────────────
create table if not exists public.tareas (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  descripcion   text,
  asignado_a    uuid references public.profiles(id) on delete set null,
  prioridad     text not null default 'media'
    check (prioridad in ('baja','media','alta','urgente')),
  estado        text not null default 'todo'
    check (estado in ('todo','doing','review','done')),
  fecha_limite  date,
  proyecto_id   uuid references public.proyectos(id) on delete set null,
  cliente_id    uuid references public.clientes(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  creado_por    uuid references public.profiles(id) on delete set null
);

-- ──────────────────────────────────────────────
-- Trigger updated_at genérico
-- ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_prospectos
  before update on public.prospectos
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_pricing
  before update on public.pricing_calculos
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_proyectos
  before update on public.proyectos
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_tareas
  before update on public.tareas
  for each row execute procedure public.set_updated_at();
