"use client";

import { ChevronLeft, Mail, Plus, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { PROJECTS } from "@/lib/mock-data";
import { fmtN } from "@/lib/utils";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import { ProjectsAssociated } from "./ProjectsAssociated";
import { PaymentsHistory } from "./PaymentsHistory";
import { ClientNotes } from "./ClientNotes";
import type { Client } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  onboarding: "Onboarding",
  paused: "Pausado",
};

interface ClienteDetailProps {
  client: Client;
  onBack: () => void;
}

export function ClienteDetail({ client, onBack }: ClienteDetailProps) {
  const router = useRouter();
  const projects = PROJECTS.filter((p) => p.client === client.name);
  const payments = [
    { d: "22 May 2026", c: "Mensualidad mayo", a: client.mrr, status: "Pagado" },
    { d: "22 Abr 2026", c: "Mensualidad abril", a: client.mrr, status: "Pagado" },
    { d: "22 Mar 2026", c: "Mensualidad marzo", a: client.mrr, status: "Pagado" },
    { d: "05 Mar 2026", c: "Onboarding fee", a: Math.round(client.mrr * 1.5), status: "Pagado" },
  ];

  return (
    <>
      <PageHead
        title={
          <>
            <Button variant="ghost" onClick={onBack} className="mb-2 text-xs">
              <ChevronLeft size={12} /> Volver
            </Button>
            <div>{client.name}</div>
          </>
        }
        subtitle={`${client.contact} · cliente desde ${client.since}`}
        actions={
          <>
            <Pill variant={client.status} dot>{STATUS_LABEL[client.status]}</Pill>
            <Button onClick={() => { window.location.href = `mailto:${client.contact.split(" ")[0].toLowerCase()}@${client.name.toLowerCase().replace(/\s/g, "")}.com`; }}><Mail size={13} />Mensaje</Button>
            <Button variant="primary" onClick={() => router.push("/proyectos")}><Plus size={14} />Nuevo proyecto</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="MRR" currency="$" value={fmtN(client.mrr)} unit="/mo" sub={client.line} />
        <StatCard label="LTV proyectado" currency="$" value={fmtN(client.mrr * 18)} sub="18 meses promedio" />
        <StatCard
          label="Health"
          value={client.health}
          unit="/100"
          delta={{ value: client.health > 80 ? "Saludable" : "Vigilar", direction: client.health > 80 ? "up" : "flat" }}
        />
        <StatCard label="Proyectos" value={client.projects} sub={`activos · ${projects.filter((p) => p.status === "entregado").length} entregados`} />
      </StatGrid>

      <div className="grid grid-cols-12 gap-[18px]">
        <div className="col-span-8 max-[1100px]:col-span-12">
          <Card>
            <CardHead>
              <CardTitle big icon={<Folder size={14} />}>Proyectos asociados</CardTitle>
            </CardHead>
            <ProjectsAssociated projects={projects} />
            <PaymentsHistory payments={payments} />
          </Card>
        </div>
        <div className="col-span-4 max-[1100px]:col-span-12">
          <ClientNotes client={client} />
        </div>
      </div>
    </>
  );
}
