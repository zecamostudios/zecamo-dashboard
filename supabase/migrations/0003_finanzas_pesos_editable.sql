-- ──────────────────────────────────────────────
-- 0003 · Finanzas: carga en pesos (ARS) + egresos fijo/variable
-- Idempotente. Agrega soporte de moneda original + cotización del blue
-- y la clasificación de egresos. monto_usd sigue siendo el valor canónico
-- para KPIs y agregaciones.
-- ──────────────────────────────────────────────

-- Columnas que la app ya usaba ad-hoc (por si faltan en algún entorno)
alter table public.transacciones add column if not exists concepto       text;
alter table public.transacciones add column if not exists linea_servicio text;
alter table public.transacciones add column if not exists owner_initials text;

-- Nuevas columnas
alter table public.transacciones add column if not exists moneda         text not null default 'USD';
alter table public.transacciones add column if not exists monto_original  numeric;
alter table public.transacciones add column if not exists cotizacion      numeric;
alter table public.transacciones add column if not exists clase_egreso    text;

-- Constraints (idempotentes)
do $$ begin
  alter table public.transacciones add constraint transacciones_moneda_chk
    check (moneda in ('USD','ARS'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.transacciones add constraint transacciones_clase_egreso_chk
    check (clase_egreso is null or clase_egreso in ('fijo','variable'));
exception when duplicate_object then null; end $$;

-- Backfill: las transacciones viejas estaban en USD
update public.transacciones
  set monto_original = monto_usd
  where monto_original is null;
