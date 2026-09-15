/**
 * Los <input type="date"> sin completar devuelven "" (string vacio), no undefined.
 * Postgres rechaza "" en una columna `date` con 22007 invalid input syntax y aborta
 * el guardado entero, y el `?? null` de toda la vida no lo agarra porque "" no es
 * nullish. Sintoma: "Guardar" no hace nada si dejaste la fecha en blanco.
 */
export function emptyToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
