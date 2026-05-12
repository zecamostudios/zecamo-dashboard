-- ============================================================
-- 0003_seed.sql — Datos de ejemplo (no usar datos reales)
-- Cargar manualmente en Supabase SQL Editor una vez que el
-- primer usuario (owner) ya esté registrado.
-- ============================================================

-- Cliente de ejemplo
insert into public.clientes (id, nombre, contacto_nombre, contacto_email, contacto_tel, fecha_inicio, mrr_usd, estado)
values
  ('00000000-0000-0000-0001-000000000001', 'Empresa Ejemplo SA', 'Ana Pérez', 'ana@ejemplo.com', '+54911000001', '2025-01-01', 500, 'activo')
on conflict (id) do nothing;

-- Prospecto de ejemplo
insert into public.prospectos (id, negocio, nombre_dueno, telefono, fuente, estado)
values
  ('00000000-0000-0000-0002-000000000001', 'Negocio Demo', 'Carlos López', '+54911000002', 'linkedin', 'initiated')
on conflict (id) do nothing;

-- Campaña outbound de ejemplo
insert into public.outbound_campanas (id, nombre, canal, fecha_inicio)
values
  ('00000000-0000-0000-0003-000000000001', 'Campaña Demo LinkedIn', 'linkedin', current_date)
on conflict (id) do nothing;
