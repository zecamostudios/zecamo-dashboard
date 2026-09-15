"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Campos con forma de ficha, no de formulario: etiqueta chica a la izquierda,
 * valor a la derecha, un hairline entre filas. El input no se dibuja como caja
 * hasta que lo tocas — la ficha se lee como un registro, no como un alta.
 *
 * Motion: solo color y borde (140ms, ease-out). Nada entra ni se mueve: esta
 * pantalla se usa todos los dias y una animacion ahi es un peaje.
 */

interface FieldRowProps {
  label: string;
  htmlFor: string;
  /** Texto de ayuda permanente. No reemplaza a la etiqueta. */
  hint?: string;
  error?: string;
  /** Acciones al ras del valor (ej: llamar / WhatsApp en el telefono). */
  action?: ReactNode;
  children: ReactNode;
}

export function FieldRow({ label, htmlFor, hint, error, action, children }: FieldRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[124px_1fr] sm:items-center gap-x-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0">
      <label
        htmlFor={htmlFor}
        className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-dim)] leading-none pt-2 sm:pt-0"
      >
        {label}
      </label>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0">{children}</div>
          {action}
        </div>
        {error ? (
          <p role="alert" className="mt-0.5 mb-1 text-[11.5px] text-[var(--color-danger)]">
            {error}
          </p>
        ) : hint ? (
          <p className="mt-0.5 mb-1 text-[11.5px] text-[var(--color-text-dim)]">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

const CONTROL_BASE = cn(
  "w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-dim)]",
  "rounded-[10px] border border-transparent outline-none",
  "transition-[background-color,border-color,box-shadow] duration-[140ms] ease-out",
  "[@media(hover:hover)]:hover:bg-white/[0.02] [@media(hover:hover)]:hover:border-[var(--color-border-2)]",
  "focus:bg-white/[0.03] focus:border-[rgba(43,91,255,0.45)] focus:shadow-[0_0_0_3px_rgba(43,91,255,0.15)]",
);

interface FieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Numeros y fechas en mono: no bailan al tipear. */
  mono?: boolean;
}

export const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(function FieldInput(
  { className, invalid, mono, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        // min-h de 44px: tamano minimo de target tactil.
        "min-h-[44px] px-3 -mx-3 text-[15px]",
        mono && "font-[family-name:var(--font-mono)] text-[14.5px] tracking-tight",
        // El calendario nativo viene claro por defecto sobre fondo oscuro.
        rest.type === "date" && "[color-scheme:dark]",
        invalid && "border-[rgba(255,84,102,0.45)]",
        className,
      )}
    />
  );
});

interface FieldTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const FieldTextarea = forwardRef<HTMLTextAreaElement, FieldTextareaProps>(function FieldTextarea(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        "block p-3 -mx-3 text-[14.5px] leading-[1.65] resize-y",
        invalid && "border-[rgba(255,84,102,0.45)]",
        className,
      )}
    />
  );
});
