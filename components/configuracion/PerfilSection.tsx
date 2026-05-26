"use client";

import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui-zecamo/Button";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { ConfigSection, Field, inputCls } from "./_shared";

export function PerfilSection() {
  // TODO: Conectar Supabase Auth — defaults vendrían de la sesión actual
  return (
    <ConfigSection title="Perfil" sub="Tu información personal y preferencias.">
      <Field label="Avatar" hint="JPG o PNG, mín 200×200">
        <div className="flex items-center gap-3.5">
          <OwnerAvatar id="JS" size="lg" />
          <Button><Plus size={12} />Cambiar</Button>
          <Button variant="ghost">Quitar</Button>
        </div>
      </Field>
      <Field label="Nombre completo">
        <input className={inputCls} defaultValue="Joaco Sánchez" />
      </Field>
      <Field label="Email principal" hint="Lo usamos para login y notificaciones.">
        <input className={inputCls} defaultValue="joaco@zecamostudios.com" />
      </Field>
      <Field label="Rol">
        <select className={inputCls} defaultValue="founder">
          <option value="founder">Founder</option>
          <option value="cofounder">Co-founder</option>
          <option value="ops">Operaciones</option>
        </select>
      </Field>
      <Field label="Zona horaria">
        <select className={inputCls} defaultValue="ar">
          <option value="ar">(GMT-3) Argentina · Buenos Aires</option>
          <option value="mx">(GMT-6) México · CDMX</option>
        </select>
      </Field>
      <Field label="Tema" hint="El dashboard está optimizado para dark mode.">
        <Tabs
          value="dark"
          onChange={() => {
            /* TODO: persistir preferencia de tema */
          }}
          tabs={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
            { value: "auto", label: "Auto" },
          ]}
        />
      </Field>
      <div className="flex gap-2 justify-end mt-4">
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary"><Check size={13} />Guardar cambios</Button>
      </div>
    </ConfigSection>
  );
}
