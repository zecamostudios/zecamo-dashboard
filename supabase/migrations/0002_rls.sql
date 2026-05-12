-- ============================================================
-- 0002_rls.sql — Row Level Security para todas las tablas
-- ============================================================

-- ──────────────────────────────────────────────
-- Helper: verifica si el usuario es owner o admin
-- ──────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol in ('owner','admin')
  );
$$;

-- ──────────────────────────────────────────────
-- Activar RLS en todas las tablas
-- ──────────────────────────────────────────────
alter table public.profiles             enable row level security;
alter table public.prospectos           enable row level security;
alter table public.interacciones_prospecto enable row level security;
alter table public.clientes             enable row level security;
alter table public.proyectos            enable row level security;
alter table public.pricing_calculos     enable row level security;
alter table public.transacciones        enable row level security;
alter table public.outbound_campanas    enable row level security;
alter table public.outbound_envios      enable row level security;
alter table public.tareas               enable row level security;

-- ──────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────
create policy "profiles_select"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- ──────────────────────────────────────────────
-- prospectos
-- ──────────────────────────────────────────────
create policy "prospectos_select"
  on public.prospectos for select
  using (auth.uid() is not null);

create policy "prospectos_insert"
  on public.prospectos for insert
  with check (auth.uid() is not null);

create policy "prospectos_update"
  on public.prospectos for update
  using (public.is_admin() or asignado_a = auth.uid());

create policy "prospectos_delete"
  on public.prospectos for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────
-- interacciones_prospecto
-- ──────────────────────────────────────────────
create policy "interacciones_select"
  on public.interacciones_prospecto for select
  using (auth.uid() is not null);

create policy "interacciones_insert"
  on public.interacciones_prospecto for insert
  with check (auth.uid() is not null);

create policy "interacciones_update"
  on public.interacciones_prospecto for update
  using (public.is_admin() or creado_por = auth.uid());

create policy "interacciones_delete"
  on public.interacciones_prospecto for delete
  using (public.is_admin() or creado_por = auth.uid());

-- ──────────────────────────────────────────────
-- clientes
-- ──────────────────────────────────────────────
create policy "clientes_select"
  on public.clientes for select
  using (auth.uid() is not null);

create policy "clientes_insert"
  on public.clientes for insert
  with check (auth.uid() is not null);

create policy "clientes_update"
  on public.clientes for update
  using (public.is_admin());

create policy "clientes_delete"
  on public.clientes for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────
-- proyectos
-- ──────────────────────────────────────────────
create policy "proyectos_select"
  on public.proyectos for select
  using (auth.uid() is not null);

create policy "proyectos_insert"
  on public.proyectos for insert
  with check (auth.uid() is not null);

create policy "proyectos_update"
  on public.proyectos for update
  using (public.is_admin());

create policy "proyectos_delete"
  on public.proyectos for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────
-- pricing_calculos
-- ──────────────────────────────────────────────
create policy "pricing_select"
  on public.pricing_calculos for select
  using (auth.uid() is not null);

create policy "pricing_insert"
  on public.pricing_calculos for insert
  with check (auth.uid() is not null);

create policy "pricing_update"
  on public.pricing_calculos for update
  using (public.is_admin() or creado_por = auth.uid());

create policy "pricing_delete"
  on public.pricing_calculos for delete
  using (public.is_admin() or creado_por = auth.uid());

-- ──────────────────────────────────────────────
-- transacciones
-- ──────────────────────────────────────────────
create policy "transacciones_select"
  on public.transacciones for select
  using (auth.uid() is not null);

create policy "transacciones_insert"
  on public.transacciones for insert
  with check (auth.uid() is not null);

create policy "transacciones_update"
  on public.transacciones for update
  using (public.is_admin());

create policy "transacciones_delete"
  on public.transacciones for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────
-- outbound_campanas
-- ──────────────────────────────────────────────
create policy "campanas_select"
  on public.outbound_campanas for select
  using (auth.uid() is not null);

create policy "campanas_insert"
  on public.outbound_campanas for insert
  with check (auth.uid() is not null);

create policy "campanas_update"
  on public.outbound_campanas for update
  using (public.is_admin());

create policy "campanas_delete"
  on public.outbound_campanas for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────
-- outbound_envios
-- ──────────────────────────────────────────────
create policy "envios_select"
  on public.outbound_envios for select
  using (auth.uid() is not null);

create policy "envios_insert"
  on public.outbound_envios for insert
  with check (auth.uid() is not null);

create policy "envios_update"
  on public.outbound_envios for update
  using (public.is_admin());

create policy "envios_delete"
  on public.outbound_envios for delete
  using (public.is_admin());

-- ──────────────────────────────────────────────
-- tareas
-- ──────────────────────────────────────────────
create policy "tareas_select"
  on public.tareas for select
  using (auth.uid() is not null);

create policy "tareas_insert"
  on public.tareas for insert
  with check (auth.uid() is not null);

create policy "tareas_update"
  on public.tareas for update
  using (public.is_admin() or asignado_a = auth.uid() or creado_por = auth.uid());

create policy "tareas_delete"
  on public.tareas for delete
  using (public.is_admin() or creado_por = auth.uid());
