-- Ficha técnica del cliente
alter table public.clientes
  add column if not exists descripcion_negocio text,
  add column if not exists problema_principal   text,
  add column if not exists solucion_implementada text;
