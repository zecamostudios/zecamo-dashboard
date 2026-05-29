"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui-zecamo/Button";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { ConfigSection, Field, inputCls } from "./_shared";
import { TeamTable } from "./TeamTable";

const DEFAULTS = { studio: "Zecamo Studios", domain: "zecamostudios.com", currency: "USD", exchangeRate: "1180" };

export function BrandSettings() {
  const [form, setForm] = useState(DEFAULTS);

  return (
    <>
      <ConfigSection title="Workspace" sub="Datos del estudio.">
        <Field label="Nombre del estudio">
          <input className={inputCls} value={form.studio} onChange={(e) => setForm((f) => ({ ...f, studio: e.target.value }))} />
        </Field>
        <Field label="Dominio">
          <input className={inputCls} value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} />
        </Field>
        <Field label="Moneda principal">
          <Tabs
            value={form.currency}
            onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
            tabs={[
              { value: "USD", label: "USD" },
              { value: "ARS", label: "ARS" },
              { value: "MXN", label: "MXN" },
            ]}
          />
        </Field>
        <Field label="Tipo de cambio USD→ARS" hint="Manual · próxima actualización: 1 Jun">
          <div className="flex items-center gap-2">
            <input className={`${inputCls} font-mono`} value={form.exchangeRate} onChange={(e) => setForm((f) => ({ ...f, exchangeRate: e.target.value }))} style={{ width: 120 }} />
            <span className="text-[var(--color-text-muted)] text-[12px]">ARS por USD</span>
          </div>
        </Field>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" onClick={() => { setForm(DEFAULTS); toast.info("Cambios descartados"); }}>Cancelar</Button>
          <Button variant="primary" onClick={() => toast.success("Configuración guardada")}>Guardar</Button>
        </div>
      </ConfigSection>

      <TeamTable />
    </>
  );
}
