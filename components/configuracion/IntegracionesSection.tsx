"use client";

import {
  Code,
  MessageSquare,
  Calendar,
  DollarSign,
  Mail,
  CheckSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ConfigSection } from "./_shared";
import { IntegrationCard } from "./IntegrationCard";

export interface Integration {
  id: string;
  name: string;
  d: string;
  c: string;
  status: "conectado" | "desconectado";
  ico: LucideIcon;
}

const INTEGRATIONS: Integration[] = [
  { id: "supabase", name: "Supabase", d: "Postgres, Auth y Storage del backend.", c: "#3FCF8E", status: "conectado", ico: Code },
  { id: "whatsapp", name: "WhatsApp Business", d: "Mensajes automatizados a clientes.", c: "#25D366", status: "conectado", ico: MessageSquare },
  { id: "calendar", name: "Google Calendar", d: "Sincroniza reuniones con el dashboard.", c: "#4285F4", status: "conectado", ico: Calendar },
  { id: "stripe", name: "Stripe", d: "Cobros en USD para clientes US.", c: "#635BFF", status: "conectado", ico: DollarSign },
  { id: "mp", name: "MercadoPago", d: "Cobros en ARS.", c: "#00BBFF", status: "conectado", ico: DollarSign },
  { id: "resend", name: "Resend", d: "Email transaccional.", c: "#0A0F1F", status: "conectado", ico: Mail },
  { id: "linear", name: "Linear", d: "Issue tracking para proyectos técnicos.", c: "#5E6AD2", status: "desconectado", ico: CheckSquare },
  { id: "slack", name: "Slack", d: "Notificaciones de actividad.", c: "#4A154B", status: "desconectado", ico: MessageSquare },
  { id: "openai", name: "OpenAI", d: "GPT-4 para AIMA · resumen IA del dashboard.", c: "#10A37F", status: "conectado", ico: Sparkles },
];

export function IntegracionesSection() {
  // TODO: Conectar Supabase tabla `integrations`
  return (
    <ConfigSection title="Integraciones" sub="Servicios externos conectados a Zecamo.">
      <div className="grid grid-cols-2 gap-3 mt-1 max-[900px]:grid-cols-1">
        {INTEGRATIONS.map((it) => <IntegrationCard key={it.id} integration={it} />)}
      </div>
    </ConfigSection>
  );
}
