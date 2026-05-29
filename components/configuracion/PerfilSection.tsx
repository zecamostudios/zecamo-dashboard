"use client";

import { useState, useRef } from "react";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui-zecamo/Button";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Tabs } from "@/components/ui-zecamo/Tabs";
import { ConfigSection, Field, inputCls } from "./_shared";

const DEFAULTS = { nombre: "Joaco Sánchez", email: "joaco@zecamostudios.com", rol: "founder", tz: "ar", tema: "dark" };

export function PerfilSection() {
  const [form, setForm] = useState(DEFAULTS);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
    toast.success("Avatar actualizado");
  }

  return (
    <ConfigSection title="Perfil" sub="Tu información personal y preferencias.">
      <Field label="Avatar" hint="JPG o PNG, mín 200×200">
        <div className="flex items-center gap-3.5">
          {avatarSrc ? (
            <Image src={avatarSrc} alt="avatar" width={36} height={36} className="rounded-xl object-cover" unoptimized />
          ) : (
            <OwnerAvatar id="JS" size="lg" />
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button onClick={() => fileRef.current?.click()}><Plus size={12} />Cambiar</Button>
          <Button variant="ghost" onClick={() => { setAvatarSrc(null); toast.info("Avatar quitado"); }}>Quitar</Button>
        </div>
      </Field>
      <Field label="Nombre completo">
        <input className={inputCls} value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
      </Field>
      <Field label="Email principal" hint="Lo usamos para login y notificaciones.">
        <input className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </Field>
      <Field label="Rol">
        <select className={inputCls} value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}>
          <option value="founder">Founder</option>
          <option value="cofounder">Co-founder</option>
          <option value="ops">Operaciones</option>
        </select>
      </Field>
      <Field label="Zona horaria">
        <select className={inputCls} value={form.tz} onChange={(e) => setForm((f) => ({ ...f, tz: e.target.value }))}>
          <option value="ar">(GMT-3) Argentina · Buenos Aires</option>
          <option value="mx">(GMT-6) México · CDMX</option>
        </select>
      </Field>
      <Field label="Tema" hint="El dashboard está optimizado para dark mode.">
        <Tabs
          value={form.tema}
          onChange={(v) => setForm((f) => ({ ...f, tema: v }))}
          tabs={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
            { value: "auto", label: "Auto" },
          ]}
        />
      </Field>
      <div className="flex gap-2 justify-end mt-4">
        <Button variant="ghost" onClick={() => { setForm(DEFAULTS); toast.info("Cambios descartados"); }}>Cancelar</Button>
        <Button variant="primary" onClick={() => toast.success("Perfil guardado")}><Check size={13} />Guardar cambios</Button>
      </div>
    </ConfigSection>
  );
}
