"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { createClient } from "@/lib/supabase/client";

interface Opts<T> {
  table: string;
  columns: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  map: (row: Record<string, unknown>, idx: number) => T;
}

/**
 * Carga filas desde el navegador al montar (donde la sesión del usuario existe
 * siempre) y las deja en estado. Hace que las páginas no queden vacías por un
 * problema de sesión del lado del servidor y que reflejen lo que cargó el
 * asistente sin recargar a mano. Si la consulta falla, se queda con `initial`.
 */
export function useLiveRows<T>(initial: T[], opts: Opts<T>): [T[], Dispatch<SetStateAction<T[]>>] {
  const [rows, setRows] = useState<T[]>(initial);

  useEffect(() => {
    let on = true;
    (async () => {
      // Cliente sin tipar para permitir tabla/columnas dinámicas.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb: any = createClient();
      let q = sb.from(opts.table).select(opts.columns);
      if (opts.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? false });
      if (opts.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (on && !error && data) {
        setRows((data as Record<string, unknown>[]).map((r, i) => opts.map(r, i)));
      }
    })();
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [rows, setRows];
}
