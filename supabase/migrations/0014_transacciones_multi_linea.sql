-- ──────────────────────────────────────────────
-- 0014 · Ingresos con múltiples servicios/líneas
-- Agrega `lineas_servicio` (array) manteniendo `linea_servicio` (single)
-- como línea primaria para compatibilidad y agregaciones existentes.
-- Idempotente.
-- ──────────────────────────────────────────────

alter table public.transacciones
  add column if not exists lineas_servicio text[];

-- Backfill: las transacciones existentes con una sola línea pasan a array de 1
update public.transacciones
  set lineas_servicio = array[linea_servicio]
  where lineas_servicio is null
    and linea_servicio is not null;
