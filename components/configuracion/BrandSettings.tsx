"use client";

import { Button } from "@/components/ui-zecamo/Button";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { ConfigSection, Field, inputCls } from "./_shared";
import { TeamTable } from "./TeamTable";

export function BrandSettings() {
  return (
    <>
      <ConfigSection title="Workspace" sub="Datos del estudio.">
        <Field label="Nombre del estudio">
          <input className={inputCls} defaultValue="Zecamo Studios" />
        </Field>
        <Field label="Dominio">
          <input className={inputCls} defaultValue="zecamostudios.com" />
        </Field>
        <Field label="Moneda principal">
          <Tabs
            value="USD"
            onChange={() => {
              /* TODO: persistir moneda principal */
            }}
            tabs={[
              { value: "USD", label: "USD" },
              { value: "ARS", label: "ARS" },
              { value: "MXN", label: "MXN" },
            ]}
          />
        </Field>
        <Field label="Tipo de cambio USD→ARS" hint="Manual · próxima actualización: 1 Jun">
          <div className="flex items-center gap-2">
            <input className={`${inputCls} font-mono`} defaultValue="1180" style={{ width: 120 }} />
            <span className="text-[var(--color-text-muted)] text-[12px]">ARS por USD</span>
          </div>
        </Field>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost">Cancelar</Button>
          <Button variant="primary">Guardar</Button>
        </div>
      </ConfigSection>

      <TeamTable />
    </>
  );
}
