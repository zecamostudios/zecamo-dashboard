-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║ Zecamo Dashboard — Migración 0016: baja de la integración Instagram   ║
-- ╚══════════════════════════════════════════════════════════════════════╝
--
-- `instagram_connections` guardaba los tokens de OAuth de las cuentas conectadas
-- para publicar desde Content OS. Content OS se retiró el 2026-08-21 y el OAuth
-- el 22, así que la tabla quedó sin nadie que la escriba ni la lea.
--
-- Se verificó antes de borrar: 0 filas. No se pierde ningún dato.
--
-- ⚠️ LO QUE NO SE TOCA: la columna `instagram` de `leads`.
-- Ese es el usuario de Instagram del PROSPECTO —el dato con el que se lo
-- contacta—, y no tiene nada que ver con esta integración. La pantalla de
-- Outbound lo usa para abrir el perfil y para sugerir por qué canal escribirle.
-- Hoy lo tienen 2 de 190 leads: poco, pero cuando es el único contacto de un
-- negocio chico, es el único contacto.

drop table if exists public.instagram_connections;
