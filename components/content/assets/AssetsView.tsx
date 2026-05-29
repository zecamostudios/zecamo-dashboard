"use client";

import { useState, useMemo } from "react";
import {
  Images,
  Plus,
  Search,
  Star,
  Zap,
  Target,
  BookOpen,
  Layers,
  Image,
  Briefcase,
  Heart,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { Card } from "@/components/ui-zecamo/Card";
import { Chip } from "@/components/ui-zecamo/Chip";
import type { ContentAsset, AssetType } from "@/lib/types";

const ASSET_TABS: { id: AssetType | "all"; label: string; icon: typeof Zap }[] = [
  { id: "all",               label: "Todos",       icon: Images },
  { id: "hook",              label: "Hooks",       icon: Zap },
  { id: "cta",               label: "CTAs",        icon: Target },
  { id: "framework",         label: "Frameworks",  icon: BookOpen },
  { id: "template_carousel", label: "Carruseles",  icon: Layers },
  { id: "logo",              label: "Logos",       icon: Image },
  { id: "brand",             label: "Brand Kit",   icon: Briefcase },
  { id: "inspiracion",       label: "Inspiración", icon: Heart },
];

interface AssetsViewProps {
  initialAssets?: ContentAsset[];
}

export function AssetsView({ initialAssets = [] }: AssetsViewProps) {
  const [assets, setAssets] = useState<ContentAsset[]>(initialAssets);
  const [activeTab, setActiveTab] = useState<AssetType | "all">("all");
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchTab = activeTab === "all" || a.tipo === activeTab;
      const matchSearch =
        !search ||
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (a.contenido ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchFav = !favoritesOnly || a.favorito;
      return matchTab && matchSearch && matchFav;
    });
  }, [assets, activeTab, search, favoritesOnly]);

  async function toggleFavorite(id: string, current: boolean) {
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, favorito: !current } : a));
    await fetch(`/api/content/assets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorito: !current }),
    });
  }

  function copyAsset(asset: ContentAsset) {
    navigator.clipboard.writeText(asset.contenido ?? asset.nombre);
    toast.success("Copiado al portapapeles");
    // increment uses
    fetch(`/api/content/assets/${asset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uses: asset.uses + 1 }),
    });
    setAssets((prev) => prev.map((a) => a.id === asset.id ? { ...a, uses: a.uses + 1 } : a));
  }

  return (
    <>
      <PageHead
        title="Assets"
        subtitle="Tu biblioteca de hooks, CTAs, templates, brand kit e inspiración"
        actions={
          <Button variant="primary">
            <Plus size={14} /> Nuevo asset
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-[14px] mb-[18px] max-[900px]:grid-cols-2">
        {ASSET_TABS.slice(1, 5).map(({ id, label, icon: Icon }) => {
          const count = assets.filter((a) => a.tipo === id).length;
          return (
            <div
              key={id}
              onClick={() => setActiveTab(id as AssetType)}
              className={
                "rounded-[20px] border p-5 cursor-pointer transition-all " +
                (activeTab === id
                  ? "border-[rgba(43,91,255,0.4)] bg-gradient-to-b from-[rgba(43,91,255,0.10)] to-[rgba(43,91,255,0.02)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-2)]")
              }
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
                  {label}
                </span>
                <Icon
                  size={15}
                  className={
                    activeTab === id
                      ? "text-[var(--color-primary-hover)]"
                      : "text-[var(--color-text-muted)]"
                  }
                />
              </div>
              <div className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-none tracking-tight">
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-[7px] bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-xl flex-1 max-w-[320px] focus-within:border-[rgba(43,91,255,0.4)] focus-within:shadow-[0_0_0_3px_rgba(43,91,255,0.08)] transition-all">
          <Search size={13} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en assets..."
            className="bg-transparent border-0 outline-0 text-[13px] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] flex-1"
          />
        </div>

        {/* Type tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {ASSET_TABS.map(({ id, label }) => (
            <Chip
              key={id}
              active={activeTab === id}
              onClick={() => setActiveTab(id as AssetType | "all")}
            >
              {label}
            </Chip>
          ))}
        </div>

        {/* Favorites toggle */}
        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          className={
            "flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border cursor-pointer transition " +
            (favoritesOnly
              ? "bg-[rgba(240,168,42,0.10)] border-[rgba(240,168,42,0.3)] text-[var(--color-warning)]"
              : "bg-transparent border-[var(--color-border-2)] text-[var(--color-text-muted)] hover:border-[var(--color-border-3)]")
          }
        >
          <Star size={12} className={favoritesOnly ? "fill-current" : ""} />
          Favoritos
        </button>
      </div>

      {/* Assets grid */}
      {filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <Images size={28} className="mx-auto mb-3 text-[var(--color-text-dim)]" />
          <p className="text-[14px] text-[var(--color-text-muted)] mb-1">
            {search ? "Sin resultados" : "La biblioteca está vacía"}
          </p>
          <p className="text-[12.5px] text-[var(--color-text-dim)]">
            Agregá hooks, CTAs y templates para usarlos en AI Studio
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onFavorite={() => toggleFavorite(asset.id, asset.favorito)}
              onCopy={() => copyAsset(asset)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function AssetCard({
  asset,
  onFavorite,
  onCopy,
}: {
  asset: ContentAsset;
  onFavorite: () => void;
  onCopy: () => void;
}) {
  const TYPE_COLOR: Record<AssetType, string> = {
    hook:              "var(--color-primary-hover)",
    cta:               "var(--color-success)",
    template_carousel: "var(--color-purple)",
    logo:              "var(--color-info)",
    brand:             "var(--color-warning)",
    inspiracion:       "var(--color-danger)",
    framework:         "var(--color-text-muted)",
  };

  return (
    <div className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-2)] transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-[10px] uppercase tracking-[0.07em] font-medium px-2 py-0.5 rounded-full border"
          style={{
            color: TYPE_COLOR[asset.tipo],
            background: `${TYPE_COLOR[asset.tipo]}15`,
            borderColor: `${TYPE_COLOR[asset.tipo]}30`,
          }}
        >
          {asset.tipo}
        </span>
        <button
          onClick={onFavorite}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-warning)] transition cursor-pointer bg-transparent border-0 p-0"
        >
          <Star
            size={14}
            className={asset.favorito ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : ""}
          />
        </button>
      </div>

      <div className="flex-1">
        <div className="text-[13.5px] font-medium mb-1.5">{asset.nombre}</div>
        {asset.contenido && (
          <p className="text-[12.5px] text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
            {asset.contenido}
          </p>
        )}
      </div>

      {asset.tags && asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {asset.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 bg-white/[0.04] border border-[var(--color-border)] rounded-full text-[var(--color-text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <span className="font-mono text-[10.5px] text-[var(--color-text-dim)]">
          {asset.uses} usos
        </span>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-lg border border-[var(--color-border-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-3)] cursor-pointer bg-transparent transition opacity-0 group-hover:opacity-100"
        >
          <Copy size={11} /> Copiar
        </button>
      </div>
    </div>
  );
}
