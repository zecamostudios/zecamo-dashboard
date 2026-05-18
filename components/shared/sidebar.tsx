"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Calculator,
  Wallet,
  Megaphone,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/crm", label: "CRM", icon: Users },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/pricing", label: "Calculadora", icon: Calculator },
  { href: "/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/outbound", label: "Outbound", icon: Megaphone },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/analytics", label: "Analíticas", icon: BarChart3 },
  { href: "/manual", label: "Manual", icon: BookOpen },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <div
            className="size-7 rounded-md flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "#ff6a3d" }}
          >
            Z
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-none">Zecamo Studios</div>
            <div className="text-[#555] text-[10px] mt-0.5">dashboard · v1</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-[#ff6a3d15] text-[#ff6a3d]"
                : "text-[#777] hover:bg-[#1a1a1a] hover:text-[#ccc]"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[#1f1f1f]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#555] hover:bg-[#1a1a1a] hover:text-[#ccc] transition-colors w-full"
        >
          <LogOut className="size-4 shrink-0" />
          Salir
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden text-[#ccc] p-2 rounded-lg"
        style={{ background: "#111" }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-56 transition-transform duration-200 md:hidden border-r border-[#1f1f1f]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "#0f0f0f" }}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 min-h-screen shrink-0 border-r border-[#1f1f1f]"
        style={{ background: "#0f0f0f" }}
      >
        <NavContent />
      </aside>
    </>
  );
}
