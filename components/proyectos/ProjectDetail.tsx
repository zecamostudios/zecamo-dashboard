"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ExternalLink, Plus, Check, CheckSquare, MessageSquare, Folder } from "lucide-react";
import { toast } from "sonner";
import { OWNERS } from "@/lib/mock-data";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Progress } from "@/components/ui-zecamo/Progress";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { StatCard, StatGrid } from "@/components/dashboard/StatCard";
import type { Project } from "@/lib/types";

const INITIAL_TASKS = [
  { t: "Wireframes finales aprobados", done: true, due: "15 Abr" },
  { t: "Diseño visual homepage", done: true, due: "28 Abr" },
  { t: "Diseño visual interna producto", done: true, due: "05 May" },
  { t: "Desarrollo frontend (Next.js)", done: false, due: "20 May", current: true },
  { t: "Integración CMS (Sanity)", done: false, due: "24 May" },
  { t: "QA + responsive testing", done: false, due: "28 May" },
  { t: "Deploy producción + DNS", done: false, due: "30 May" },
];

const NOTES = [
  { d: "22 May", t: "Cliente pidió ajustar la paleta — más cálida, menos saturada. Subir referencias al Drive." },
  { d: "18 May", t: "Definimos que el blog queda para v2.1. Backlog." },
  { d: "15 May", t: "Stack final: Next 14, Sanity, Vercel, Resend." },
];

const FILES = [
  { n: "Wireframes v3.fig", s: "4.2 MB" },
  { n: "Mockups visuales.zip", s: "28 MB" },
  { n: "Brief inicial.pdf", s: "840 KB" },
];

const MODAL_INPUT = "w-full rounded-xl bg-white/[0.04] border border-[var(--color-border)] text-[13px] px-3 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] transition";

export function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const owner = OWNERS.find((o) => o.id === project.owner);
  const filesRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState("");

  function toggleTask(i: number) {
    setTasks((prev) => prev.map((tk, idx) => idx === i ? { ...tk, done: !tk.done } : tk));
  }

  function saveTask() {
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, { t: newTask.trim(), done: false, due: "—" }]);
    setNewTask("");
    setAddingTask(false);
    toast.success("Tarea agregada");
  }

  const done = tasks.filter((tk) => tk.done).length;
  const progress = Math.round((done / tasks.length) * 100);

  return (
    <>
      <PageHead
        title={
          <>
            <Button variant="ghost" onClick={onBack} className="mb-2 text-xs">
              <ChevronLeft size={12} /> Volver
            </Button>
            <div>{project.name}</div>
          </>
        }
        subtitle={
          <>
            {project.client} · <Pill variant={project.line}>{project.line}</Pill>
          </>
        }
        actions={
          <>
            <Pill variant={project.status} dot>{project.status}</Pill>
            <Button onClick={() => filesRef.current?.scrollIntoView({ behavior: "smooth" })}><ExternalLink size={12} />Ver archivos</Button>
            <Button variant="primary" onClick={() => setAddingTask(true)}><Plus size={14} />Nueva tarea</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Progreso" value={progress} unit="%" extra={<div className="mt-2"><Progress value={progress} /></div>} />
        <StatCard label="Deadline" value={project.due} sub={`desde ${project.start}`} />
        <StatCard
          label="Owner"
          value={
            <div className="flex items-center gap-2.5 mt-0.5">
              <OwnerAvatar id={project.owner} />
              <span className="font-[family-name:var(--font-display)] text-[18px] font-medium">{owner?.name}</span>
            </div>
          }
        />
        <StatCard
          label="Prioridad"
          value={<span className="capitalize" style={{ color: project.priority === "alta" ? "var(--color-warning)" : "var(--color-text)" }}>{project.priority}</span>}
          sub={`${project.team.length} personas`}
        />
      </StatGrid>

      <div className="grid grid-cols-12 gap-[18px]">
        <div className="col-span-8 max-[1100px]:col-span-12">
          <Card>
            <CardHead>
              <CardTitle big icon={<CheckSquare size={14} />}>Tareas del proyecto</CardTitle>
              <span className="text-[11.5px] text-[var(--color-text-muted)]">{done}/{tasks.length}</span>
            </CardHead>

            {addingTask && (
              <div className="pb-3 mb-1 border-b border-[var(--color-border)] flex gap-2">
                <input
                  autoFocus
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveTask(); if (e.key === "Escape") { setAddingTask(false); setNewTask(""); } }}
                  placeholder="Nombre de la tarea… (Enter para guardar)"
                  className={MODAL_INPUT}
                />
                <button onClick={() => { setAddingTask(false); setNewTask(""); }} className="px-3 py-2 rounded-xl text-[12px] border border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent cursor-pointer">Cancelar</button>
              </div>
            )}

            {tasks.map((tk, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-[var(--color-border)] last:border-0">
                <button
                  onClick={() => toggleTask(i)}
                  className={`w-[18px] h-[18px] mt-0.5 rounded-md border grid place-items-center shrink-0 cursor-pointer transition ${
                    tk.done ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white" : "border-[var(--color-border-2)] bg-transparent"
                  }`}
                >
                  {tk.done && <Check size={12} />}
                </button>
                <div className="flex-1">
                  <div className={`text-[13px] ${tk.done ? "line-through text-[var(--color-text-dim)]" : "text-[var(--color-text)]"}`}>{tk.t}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] font-mono mt-0.5">Vence: {tk.due}</div>
                </div>
                {"current" in tk && tk.current && !tk.done && <Pill variant="curso" dot>En curso</Pill>}
              </div>
            ))}
          </Card>
        </div>

        <div className="col-span-4 max-[1100px]:col-span-12">
          <Card>
            <CardHead>
              <CardTitle big icon={<MessageSquare size={14} />}>Notas</CardTitle>
            </CardHead>
            {NOTES.map((n, i) => (
              <div key={i} className="py-3 border-b border-[var(--color-border)] last:border-0">
                <div className="text-[11px] text-[var(--color-text-muted)] mb-1 font-mono">{n.d}</div>
                <div className="text-[13px] text-[var(--color-text)] leading-relaxed">{n.t}</div>
              </div>
            ))}

            <div className="mt-5 pt-5 border-t border-[var(--color-border)]" ref={filesRef}>
              <CardTitle big icon={<Folder size={14} />}>Archivos</CardTitle>
              <div className="mt-3">
                {FILES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-[var(--color-border)] last:border-0 text-[12.5px] cursor-pointer hover:text-[var(--color-primary-hover)] transition" onClick={() => toast.info(`Abriendo ${f.n}…`)}>
                    <Folder size={14} />
                    <span className="flex-1">{f.n}</span>
                    <span className="font-mono text-[11px] text-[var(--color-text-muted)]">{f.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
