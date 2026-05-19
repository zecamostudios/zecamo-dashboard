"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sections = [
  { slug: "manifiesto", label: "Manifiesto", num: "01", grp: "operacion" },
  { slug: "lineas-servicio", label: "Líneas de servicio", num: "02", grp: "operacion" },
  { slug: "stack-entrega", label: "Stack y entrega", num: "03", grp: "operacion" },
  { slug: "proceso-comercial", label: "Proceso comercial", num: "04", grp: "operacion" },
  { slug: "pricing", label: "Pricing", num: "05", grp: "negocio" },
  { slug: "playbooks", label: "Playbooks", num: "06", grp: "negocio" },
  { slug: "operacion-interna", label: "Operación interna", num: "07", grp: "negocio" },
  { slug: "roadmap", label: "Roadmap 90 días", num: "08", grp: "negocio" },
];

export function ManualSidebar({ currentSlug }: { currentSlug?: string } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileOpen, setMobileOpen] = useState(false);

  const slug = currentSlug ?? pathname.split("/").pop() ?? "";

  useEffect(() => {
    const saved = localStorage.getItem("zec-manual-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-zec-theme", saved);
    } else {
      document.documentElement.setAttribute("data-zec-theme", "dark");
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-zec-theme", next);
    localStorage.setItem("zec-manual-theme", next);
  }

  // Keyboard shortcut: g + 1-8
  useEffect(() => {
    let gPressed = false;
    let timer: ReturnType<typeof setTimeout>;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        gPressed = true;
        clearTimeout(timer);
        timer = setTimeout(() => { gPressed = false; }, 1000);
        return;
      }
      if (gPressed) {
        const idx = parseInt(e.key);
        if (idx >= 1 && idx <= 8) {
          gPressed = false;
          const target = sections[idx - 1];
          if (target) router.push(`/manual/${target.slug}`);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const operacion = sections.filter((s) => s.grp === "operacion");
  const negocio = sections.filter((s) => s.grp === "negocio");

  const navContent = (
    <>
      <div className="zec-brand">
        <div className="zec-brand-mark">Z</div>
        <div style={{ flex: 1 }}>
          <div className="zec-brand-name">Zecamo Studios</div>
          <div className="zec-brand-sub">manual / v1.0</div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="zec-mobile-close-btn"
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      <div className="zec-sidebar-meta">
        <div className="zec-meta-row"><span>Base</span><b>Tucumán, AR</b></div>
        <div className="zec-meta-row"><span>Equipo</span><b>3 socios</b></div>
        <div className="zec-meta-row"><span>Actualizado</span><b>may 2026</b></div>
      </div>

      <nav className="zec-toc">
        <div className="zec-toc-group">Operación</div>
        {operacion.map((s) => (
          <Link
            key={s.slug}
            href={`/manual/${s.slug}`}
            className={`zec-toc-link ${slug === s.slug ? "zec-toc-link--active" : ""}`}
          >
            <span className="zec-toc-num">{s.num}</span>
            {s.label}
          </Link>
        ))}

        <div className="zec-toc-group">Negocio</div>
        {negocio.map((s) => (
          <Link
            key={s.slug}
            href={`/manual/${s.slug}`}
            className={`zec-toc-link ${slug === s.slug ? "zec-toc-link--active" : ""}`}
          >
            <span className="zec-toc-num">{s.num}</span>
            {s.label}
          </Link>
        ))}
      </nav>

      <div className="zec-sidebar-foot">
        <span className="zec-internal-label">interno · v1.0</span>
        <button onClick={toggleTheme} className="zec-theme-toggle">
          {theme === "dark" ? "☀ Light" : "☽ Dark"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="zec-mobile-bar">
        <div className="zec-brand-mark" style={{ width: 32, height: 32, fontSize: 16 }}>Z</div>
        <span className="zec-brand-name" style={{ flex: 1 }}>Zecamo Studios</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="zec-hamburger"
          aria-label="Abrir menú"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="zec-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`zec-sidebar${mobileOpen ? " zec-sidebar--mobile-open" : ""}`}>
        {navContent}
      </aside>
    </>
  );
}
