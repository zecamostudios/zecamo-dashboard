-- ──────────────────────────────────────────────
-- 0013 · Finanzas: categorías de egreso, vínculo cliente + mensualidad
--        en ingresos, y tabla de configuración para objetivos editables.
-- Idempotente.
-- ──────────────────────────────────────────────

-- Transacciones ----------------------------------------------------
-- `categoria` ya existe (0001) y se reutiliza para la categoría de gasto
-- de los egresos (Herramientas, Sueldos, Publicidad, etc.).
-- `cliente_id` ya existe (0001) y se usa para vincular un ingreso al
-- cliente que paga. Solo agregamos la marca de mensualidad.
alter table public.transacciones
  add column if not exists es_mensualidad boolean not null default false;

-- ──────────────────────────────────────────────
-- app_config · clave/valor para objetivos y ajustes editables
-- ──────────────────────────────────────────────
create table if not exists public.app_config (
  clave       text primary key,
  valor       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- Valor por defecto del objetivo de MRR (editable desde el dashboard)
insert into public.app_config (clave, valor)
values ('mrr_objetivo', '8500'::jsonb)
on conflict (clave) do nothing;

alter table public.app_config enable row level security;

-- Lectura para cualquier usuario autenticado; escritura para admin/owner.
do $$ begin
  create policy "app_config_select"
    on public.app_config for select
    using (auth.uid() is not null);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "app_config_insert"
    on public.app_config for insert
    with check (public.is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "app_config_update"
    on public.app_config for update
    using (public.is_admin());
exception when duplicate_object then null; end $$;

-- Trigger updated_at
do $$ begin
  create trigger set_updated_at_app_config
    before update on public.app_config
    for each row execute procedure public.set_updated_at();
exception when duplicate_object then null; end $$;
