"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  DollarSign,
  Zap,
  Settings,
  TestTube2,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";

// ── Types ────────────────────────────────────────────────────────────────────

interface AISettingsData {
  provider:    "openai" | "mock";
  hasApiKey:   boolean;
  keyPreview:  string | null;
  model:       string;
  temperature: number;
  maxTokens:   number;
  isMock:      boolean;
  supportedModels: { id: string; label: string; tier: string; contextK: number }[];
  costs:       Record<string, { input: number; output: number }>;
  envHints:    Record<string, string>;
}

interface UsageSession {
  totalGenerations: number;
  totalTokens:      number;
  estimatedCostUSD: number;
  lastModel:        string;
}

// ── Cost calculator ──────────────────────────────────────────────────────────

function calcCost(
  model: string,
  tokens: number,
  costs: Record<string, { input: number; output: number }>,
): number {
  const c = costs[model] ?? costs["gpt-4o"] ?? { input: 2.5, output: 10 };
  // Estimate 60% input / 40% output
  return ((tokens * 0.6) / 1_000_000) * c.input
       + ((tokens * 0.4) / 1_000_000) * c.output;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
        ok
          ? "bg-[rgba(34,197,139,0.10)] border-[rgba(34,197,139,0.25)] text-[var(--color-success)]"
          : "bg-[rgba(255,84,102,0.10)] border-[rgba(255,84,102,0.25)] text-[var(--color-danger)]"
      }`}
    >
      {ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
      {label}
    </div>
  );
}

function EnvHint({ name, value }: { name: string; value: string }) {
  const isSet = !value.startsWith("(") && value !== "missing";
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
      <code className="text-[11.5px] text-[var(--color-text-muted)] font-mono">{name}</code>
      <span className={`text-[11px] font-mono ${isSet ? "text-[var(--color-success)]" : "text-[var(--color-text-dim)]"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AISettingsView() {
  const [settings, setSettings] = useState<AISettingsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [testing, setTesting]   = useState(false);
  const [usage, setUsage]       = useState<UsageSession>({
    totalGenerations: 0,
    totalTokens:      0,
    estimatedCostUSD: 0,
    lastModel:        "",
  });

  // Local overrides (stored in localStorage, sent with generation requests)
  const [localModel, setLocalModel]           = useState("");
  const [localTemperature, setLocalTemperature] = useState(0.7);
  const [localMaxTokens, setLocalMaxTokens]   = useState(2048);

  useEffect(() => {
    fetchSettings();

    // Load usage session from localStorage
    try {
      const saved = localStorage.getItem("ai_usage_session");
      if (saved) setUsage(JSON.parse(saved) as UsageSession);
      const savedModel = localStorage.getItem("ai_local_model");
      const savedTemp  = localStorage.getItem("ai_local_temperature");
      const savedTokens = localStorage.getItem("ai_local_max_tokens");
      if (savedModel)  setLocalModel(savedModel);
      if (savedTemp)   setLocalTemperature(Number(savedTemp));
      if (savedTokens) setLocalMaxTokens(Number(savedTokens));
    } catch {}
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/content/ai-settings");
      if (!res.ok) throw new Error();
      const data = await res.json() as AISettingsData;
      setSettings(data);
      if (!localModel) setLocalModel(data.model);
    } catch {
      toast.error("Error al cargar configuración de IA");
    } finally {
      setLoading(false);
    }
  }

  function saveLocalPreferences() {
    try {
      localStorage.setItem("ai_local_model",       localModel);
      localStorage.setItem("ai_local_temperature",  String(localTemperature));
      localStorage.setItem("ai_local_max_tokens",   String(localMaxTokens));
      toast.success("Preferencias guardadas en este navegador");
    } catch {
      toast.error("No se pudo guardar en localStorage");
    }
  }

  async function runTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/content/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo:      "hook",
          plataforma:"linkedin",
          prompt:    "Test de conectividad con la IA",
          context:   { tono: "profesional" },
          settings: {
            model:      localModel,
            temperature: localTemperature,
            maxTokens:  localMaxTokens,
          },
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const newTokens = (data.tokens ?? 200);
      const cost = settings
        ? calcCost(localModel, newTokens, settings.costs)
        : 0;

      const newUsage: UsageSession = {
        totalGenerations: usage.totalGenerations + 1,
        totalTokens:      usage.totalTokens + newTokens,
        estimatedCostUSD: usage.estimatedCostUSD + cost,
        lastModel:        data.model ?? localModel,
      };

      setUsage(newUsage);
      try { localStorage.setItem("ai_usage_session", JSON.stringify(newUsage)); } catch {}

      toast.success(
        data.isMock
          ? `Mock OK — modelo: ${data.model ?? "mock-v1"}`
          : `OpenAI OK — ${newTokens} tokens, $${cost.toFixed(5)}`,
      );
    } catch (err) {
      toast.error(`Test fallido: ${err instanceof Error ? err.message : "error"}`);
    } finally {
      setTesting(false);
    }
  }

  function resetUsage() {
    const empty: UsageSession = { totalGenerations: 0, totalTokens: 0, estimatedCostUSD: 0, lastModel: "" };
    setUsage(empty);
    try { localStorage.removeItem("ai_usage_session"); } catch {}
    toast.success("Contador de uso reiniciado");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary-hover)]/30 border-t-[var(--color-primary-hover)] animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  const activeModel  = settings.supportedModels.find((m) => m.id === localModel);
  const activeCosts  = settings.costs[localModel] ?? settings.costs["gpt-4o"];

  return (
    <>
      <PageHead
        title="AI Settings"
        subtitle="Configuración del proveedor de IA y seguimiento de uso"
        actions={
          <Button variant="primary" onClick={runTest} disabled={testing}>
            <TestTube2 size={13} />
            {testing ? "Probando..." : "Test de conexión"}
          </Button>
        }
      />

      {/* Provider status */}
      <div className="grid grid-cols-3 gap-[14px] mb-[14px] max-[900px]:grid-cols-1">
        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium mb-3">
            Proveedor activo
          </div>
          <div className="flex items-center gap-2.5 mb-2">
            <Cpu size={18} className={settings.isMock ? "text-[var(--color-text-dim)]" : "text-[var(--color-primary-hover)]"} />
            <span className="font-[family-name:var(--font-display)] text-[22px] font-medium">
              {settings.isMock ? "Mock" : "OpenAI"}
            </span>
          </div>
          <StatusBadge
            ok={!settings.isMock}
            label={settings.isMock ? "Sin API key" : `Conectado · ${settings.keyPreview}`}
          />
        </div>

        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium mb-3">
            Modelo activo
          </div>
          <div className="font-[family-name:var(--font-display)] text-[22px] font-medium text-[var(--color-primary-hover)] mb-2">
            {activeModel?.label ?? localModel}
          </div>
          <div className="flex items-center gap-2">
            {activeModel && (
              <span className={`text-[10.5px] px-2 py-0.5 rounded-full border font-medium ${
                activeModel.tier === "best"
                  ? "bg-[rgba(43,91,255,0.1)] border-[rgba(43,91,255,0.25)] text-[var(--color-primary-hover)]"
                  : activeModel.tier === "fast"
                  ? "bg-[rgba(34,197,139,0.1)] border-[rgba(34,197,139,0.25)] text-[var(--color-success)]"
                  : "bg-white/[0.04] border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}>
                {activeModel.tier}
              </span>
            )}
            <span className="text-[10.5px] text-[var(--color-text-dim)]">{activeModel?.contextK}K ctx</span>
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] font-medium mb-3">
            Temperatura
          </div>
          <div className="font-[family-name:var(--font-display)] text-[34px] font-medium leading-none text-[#F59E0B] mb-2">
            {localTemperature.toFixed(1)}
          </div>
          <p className="text-[11px] text-[var(--color-text-dim)]">
            {localTemperature < 0.4 ? "Determinista y consistente"
              : localTemperature < 0.7 ? "Balance creatividad/coherencia"
              : "Creativo y variado"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-[14px]">
        {/* Left: controls */}
        <div className="col-span-7 max-[1100px]:col-span-12 flex flex-col gap-[14px]">

          {/* Model selector */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Sparkles size={16} />}>Modelo</CardTitle>
              {settings.isMock && (
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-warning)]">
                  <AlertCircle size={12} />
                  <span>Requiere OPENAI_API_KEY para activar</span>
                </div>
              )}
            </CardHead>
            <div className="grid grid-cols-2 gap-2">
              {settings.supportedModels.map((m) => {
                const active  = localModel === m.id;
                const costs   = settings.costs[m.id];
                return (
                  <button
                    key={m.id}
                    onClick={() => setLocalModel(m.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      active
                        ? "border-[rgba(43,91,255,0.4)] bg-gradient-to-b from-[rgba(43,91,255,0.12)] to-[rgba(43,91,255,0.04)]"
                        : "border-[var(--color-border-2)] bg-[var(--color-surface)] hover:border-[var(--color-border-3)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[13px] font-medium ${active ? "text-[var(--color-primary-hover)]" : "text-[var(--color-text)]"}`}>
                        {m.label}
                      </span>
                      <span className={`text-[9.5px] px-1.5 py-0.5 rounded border ${
                        m.tier === "best"    ? "bg-[rgba(43,91,255,0.1)] border-[rgba(43,91,255,0.2)] text-[var(--color-primary-hover)]"
                        : m.tier === "fast"  ? "bg-[rgba(34,197,139,0.1)] border-[rgba(34,197,139,0.2)] text-[var(--color-success)]"
                        : m.tier === "economy" ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-[var(--color-warning)]"
                        : "bg-white/[0.04] border-[var(--color-border)] text-[var(--color-text-dim)]"
                      }`}>
                        {m.tier}
                      </span>
                    </div>
                    {costs && (
                      <p className="text-[10.5px] text-[var(--color-text-dim)]">
                        ${costs.input}/M in · ${costs.output}/M out
                      </p>
                    )}
                    <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">{m.contextK}K context</p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Temperature + Max tokens */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Settings size={16} />}>Parámetros de generación</CardTitle>
            </CardHead>
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-medium text-[var(--color-text)]">
                    Temperatura
                  </label>
                  <span className="text-[12px] font-mono text-[var(--color-primary-hover)]">
                    {localTemperature.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localTemperature}
                  onChange={(e) => setLocalTemperature(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary-hover)]"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[var(--color-text-dim)]">0.0 · Determinista</span>
                  <span className="text-[10px] text-[var(--color-text-dim)]">1.0 · Creativo</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-medium text-[var(--color-text)]">
                    Máximo de tokens
                  </label>
                  <span className="text-[12px] font-mono text-[var(--color-primary-hover)]">
                    {localMaxTokens.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={localMaxTokens}
                  onChange={(e) => setLocalMaxTokens(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary-hover)]"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[var(--color-text-dim)]">256 · Rápido</span>
                  <span className="text-[10px] text-[var(--color-text-dim)]">4096 · Completo</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-2 border-t border-[var(--color-border)]">
              <Button onClick={saveLocalPreferences} className="flex-1 justify-center">
                Guardar preferencias
              </Button>
            </div>
          </Card>

          {/* Env hints */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Settings size={16} />}>Variables de entorno</CardTitle>
            </CardHead>
            <div>
              {Object.entries(settings.envHints).map(([k, v]) => (
                <EnvHint key={k} name={k} value={v} />
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-dim)] mt-3">
              Para cambiar el proveedor en producción, actualizá las variables en Vercel y redesplegá.
            </p>
          </Card>
        </div>

        {/* Right: usage + cost */}
        <div className="col-span-5 max-[1100px]:col-span-12 flex flex-col gap-[14px]">

          {/* Session usage */}
          <Card>
            <CardHead>
              <CardTitle big icon={<BarChart3 size={16} />}>Uso en esta sesión</CardTitle>
              <button
                onClick={resetUsage}
                className="flex items-center gap-1 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-text)] bg-transparent border-0 cursor-pointer transition"
              >
                <RefreshCw size={10} /> Reset
              </button>
            </CardHead>
            <div className="flex flex-col gap-3">
              {[
                { label: "Generaciones",  value: usage.totalGenerations, icon: Zap, color: "var(--color-primary-hover)" },
                { label: "Tokens totales",value: usage.totalTokens.toLocaleString(), icon: Cpu, color: "var(--color-success)" },
                { label: "Último modelo", value: usage.lastModel || "—", icon: Sparkles, color: "#A47BFF" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2.5">
                    <s.icon size={14} style={{ color: s.color }} />
                    <span className="text-[12px] text-[var(--color-text-muted)]">{s.label}</span>
                  </div>
                  <span className="text-[13px] font-medium font-mono" style={{ color: s.color }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Cost estimate */}
          <Card>
            <CardHead>
              <CardTitle big icon={<DollarSign size={16} />}>
                Costo estimado (sesión)
              </CardTitle>
            </CardHead>
            <div className="text-center py-4">
              <div className="font-[family-name:var(--font-display)] text-[40px] font-medium text-[var(--color-success)] leading-none mb-1">
                ${usage.estimatedCostUSD.toFixed(4)}
              </div>
              <p className="text-[11.5px] text-[var(--color-text-dim)]">USD · basado en {usage.totalTokens.toLocaleString()} tokens</p>
            </div>
            {activeCosts && (
              <div className="mt-2 pt-3 border-t border-[var(--color-border)]">
                <p className="text-[11px] text-[var(--color-text-muted)] mb-2">Precios para {activeModel?.label ?? localModel}</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-[var(--color-text-dim)]">Input</span>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)]">${activeCosts.input}/1M tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-[var(--color-text-dim)]">Output</span>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)]">${activeCosts.output}/1M tokens</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Publishing status */}
          <Card>
            <CardHead>
              <CardTitle big icon={<Zap size={16} />}>
                Estado de publicación
              </CardTitle>
            </CardHead>
            <div className="flex flex-col gap-2">
              {[
                { platform: "LinkedIn",  envKey: "LINKEDIN_ACCESS_TOKEN",  ok: !!process.env.LINKEDIN_ACCESS_TOKEN },
                { platform: "Twitter",   envKey: "TWITTER_BEARER_TOKEN",   ok: false },
                { platform: "Instagram", envKey: "INSTAGRAM_ACCESS_TOKEN", ok: false },
                { platform: "Facebook",  envKey: "FACEBOOK_ACCESS_TOKEN",  ok: false },
              ].map((p) => (
                <div key={p.platform} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-[12px] text-[var(--color-text)]">{p.platform}</span>
                  <StatusBadge ok={p.ok} label={p.ok ? "Conectado" : "Mock"} />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-dim)] mt-3">
              Los adaptadores mock simulan publicación con un 5% de tasa de error para testing realista.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
