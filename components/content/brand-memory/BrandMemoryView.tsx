"use client";

import { useState, useMemo } from "react";
import {
  Brain,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card } from "@/components/ui-zecamo/Card";
import { Chip } from "@/components/ui-zecamo/Chip";
import type { BrandMemory } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  tono:            "Tono y personalidad",
  posicionamiento: "Posicionamiento",
  servicios:       "Servicios",
  audiencia:       "Audiencia",
  pilares:         "Pilares de contenido",
  cta_patterns:    "Patrones de CTA",
  frameworks:      "Frameworks",
  vocabulario:     "Vocabulario",
  restricciones:   "Restricciones",
};

const CATEGORY_COLORS: Record<string, string> = {
  tono:            "#A47BFF",
  posicionamiento: "#2B5BFF",
  servicios:       "#22C58B",
  audiencia:       "#F59E0B",
  pilares:         "#EC4899",
  cta_patterns:    "#06B6D4",
  frameworks:      "#8B5CF6",
  vocabulario:     "#10B981",
  restricciones:   "#EF4444",
};

interface BrandMemoryViewProps {
  initialMemory?: BrandMemory[];
}

export function BrandMemoryView({ initialMemory = [] }: BrandMemoryViewProps) {
  const [memory, setMemory] = useState<BrandMemory[]>(initialMemory);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newForm, setNewForm] = useState({ categoria: "tono", clave: "", valor: "" });
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(memory.map((m) => m.categoria))).sort();
    return cats;
  }, [memory]);

  const filtered = useMemo(
    () => categoryFilter === "all" ? memory : memory.filter((m) => m.categoria === categoryFilter),
    [memory, categoryFilter],
  );

  const grouped = useMemo(() => {
    const g: Record<string, BrandMemory[]> = {};
    filtered.forEach((m) => {
      if (!g[m.categoria]) g[m.categoria] = [];
      g[m.categoria].push(m);
    });
    return g;
  }, [filtered]);

  async function toggleItem(item: BrandMemory) {
    const next = !item.activo;
    setMemory((prev) => prev.map((m) => m.id === item.id ? { ...m, activo: next } : m));
    const res = await fetch("/api/content/brand-memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, activo: next }),
    });
    if (!res.ok) {
      setMemory((prev) => prev.map((m) => m.id === item.id ? { ...m, activo: item.activo } : m));
      toast.error("Error al actualizar");
    }
  }

  async function deleteItem(id: string) {
    const prev = memory;
    setMemory((m) => m.filter((x) => x.id !== id));
    const res = await fetch(`/api/content/brand-memory?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      setMemory(prev);
      toast.error("Error al eliminar");
    } else {
      toast.success("Entrada eliminada");
    }
  }

  async function saveEdit(item: BrandMemory) {
    if (!editValue.trim()) return;
    const prev = item.valor;
    setMemory((m) => m.map((x) => x.id === item.id ? { ...x, valor: editValue } : x));
    setEditingId(null);
    const res = await fetch("/api/content/brand-memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, valor: editValue }),
    });
    if (!res.ok) {
      setMemory((m) => m.map((x) => x.id === item.id ? { ...x, valor: prev } : x));
      toast.error("Error al guardar");
    } else {
      toast.success("Guardado");
    }
  }

  async function addItem() {
    if (!newForm.clave.trim() || !newForm.valor.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/content/brand-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newForm, activo: true, orden: 0 }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json() as BrandMemory;
      setMemory((prev) => [...prev, created]);
      setNewForm({ categoria: "tono", clave: "", valor: "" });
      setShowAdd(false);
      toast.success("Entrada agregada");
    } catch {
      toast.error("Error al agregar");
    } finally {
      setSaving(false);
    }
  }

  const activeCount = memory.filter((m) => m.activo).length;

  return (
    <>
      <PageHead
        title="Brand Memory"
        subtitle="Contexto de marca inyectado automáticamente en cada generación de AI"
        actions={
          <Button variant="primary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Agregar entrada
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-[14px] mb-[18px] max-[700px]:grid-cols-1">
        <StatCard label="Entradas activas"    value={activeCount}          color="var(--color-success)" />
        <StatCard label="Total de entradas"   value={memory.length}        color="var(--color-primary-hover)" />
        <StatCard label="Categorías"          value={categories.length}    color="var(--color-warning)" />
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Chip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>Todas</Chip>
        {categories.map((c) => (
          <Chip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
            {CATEGORY_LABELS[c] ?? c}
          </Chip>
        ))}
      </div>

      {/* Groups */}
      {Object.entries(grouped).length === 0 ? (
        <Card className="py-16 text-center">
          <Brain size={28} className="mx-auto mb-3 text-[var(--color-text-dim)]" />
          <p className="text-[14px] text-[var(--color-text-muted)] mb-1">Sin entradas de memoria</p>
          <p className="text-[12.5px] text-[var(--color-text-dim)]">
            Agregá contexto de marca para mejorar las generaciones de AI
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <Tag size={12} style={{ color: CATEGORY_COLORS[cat] ?? "#888" }} />
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
                <span className="text-[10.5px] text-[var(--color-text-dim)]">
                  ({items.filter((i) => i.activo).length}/{items.length} activas)
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border px-4 py-3 flex items-start gap-3 group transition-all ${
                      item.activo
                        ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] opacity-40"
                    }`}
                  >
                    {/* Toggle */}
                    <button
                      onClick={() => toggleItem(item)}
                      className="mt-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition shrink-0"
                    >
                      {item.activo
                        ? <ToggleRight size={18} className="text-[var(--color-success)]" />
                        : <ToggleLeft size={18} />
                      }
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="text-[10.5px] font-mono uppercase text-[var(--color-text-dim)] mb-0.5">
                        {item.clave}
                      </div>
                      {editingId === item.id ? (
                        <div className="flex items-start gap-2 mt-1">
                          <textarea
                            rows={3}
                            className="flex-1 rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-2 py-1 text-[12.5px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] resize-none"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.ctrlKey) saveEdit(item);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                          />
                          <button onClick={() => saveEdit(item)} className="text-[var(--color-success)] cursor-pointer">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-[var(--color-text-muted)] cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[13px] text-[var(--color-text)] leading-snug">
                          {item.valor}
                        </p>
                      )}
                    </div>

                    {/* Item actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => { setEditingId(item.id); setEditValue(item.valor); }}
                        className="w-7 h-7 rounded-lg border border-[var(--color-border)] bg-transparent grid place-items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="w-7 h-7 rounded-lg border border-[rgba(255,84,102,0.25)] bg-transparent grid place-items-center text-[var(--color-danger)] cursor-pointer hover:bg-[rgba(255,84,102,0.1)] transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border-2)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-[15px] font-semibold mb-4">Nueva entrada de Brand Memory</h3>

            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 font-medium">
                  Categoría
                </label>
                <select
                  value={newForm.categoria}
                  onChange={(e) => setNewForm((f) => ({ ...f, categoria: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)]"
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 font-medium">
                  Clave (identificador interno)
                </label>
                <input
                  value={newForm.clave}
                  onChange={(e) => setNewForm((f) => ({ ...f, clave: e.target.value }))}
                  placeholder="ej: tono_principal"
                  className="w-full h-9 rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] px-3 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] placeholder:text-[var(--color-text-dim)]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] mb-1.5 font-medium">
                  Valor
                </label>
                <textarea
                  value={newForm.valor}
                  onChange={(e) => setNewForm((f) => ({ ...f, valor: e.target.value }))}
                  placeholder="Describe este aspecto de la marca..."
                  rows={3}
                  className="w-full rounded-xl border border-[var(--color-border-2)] bg-[var(--color-surface)] px-3 py-2 text-[13px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary-hover)] resize-none placeholder:text-[var(--color-text-dim)]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Button>
              <Button
                variant="primary"
                onClick={addItem}
                disabled={saving || !newForm.clave.trim() || !newForm.valor.trim()}
              >
                {saving ? "Guardando..." : "Agregar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium mb-3">{label}</div>
      <div className="font-[family-name:var(--font-display)] text-[34px] font-medium leading-none tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
