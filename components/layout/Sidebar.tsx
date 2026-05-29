"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  User,
  Folder,
  Calculator,
  Wallet,
  Megaphone,
  CheckSquare,
  BarChart3,
  BookOpen,
  Settings,
  ChevronUp,
  Sparkles,
  CalendarDays,
  ListVideo,
  Images,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  dot?: boolean;
  external?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  tasksCount?: number;
  prospectsCount?: number;
}

export function Sidebar({ tasksCount, prospectsCount }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const groups: NavGroup[] = [
    {
      label: "General",
      items: [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/crm", label: "CRM", icon: Users, badge: prospectsCount },
        { href: "/clientes", label: "Clientes", icon: User },
        { href: "/proyectos", label: "Proyectos", icon: Folder },
      ],
    },
    {
      label: "Operación",
      items: [
        { href: "/pricing", label: "Calculadora", icon: Calculator },
        { href: "/finanzas", label: "Finanzas", icon: Wallet },
        { href: "/outbound", label: "Outbound", icon: Megaphone, dot: true },
        { href: "/tareas", label: "Tareas", icon: CheckSquare, badge: tasksCount },
        { href: "/analytics", label: "Analíticas", icon: BarChart3 },
      ],
    },
    {
      label: "Content OS",
      items: [
        { href: "/content/ai-studio", label: "AI Studio", icon: Sparkles, dot: true },
        { href: "/content/queue", label: "Queue", icon: ListVideo },
        { href: "/content/planner", label: "Planner", icon: CalendarDays },
        { href: "/content/assets", label: "Assets", icon: Images },
        { href: "/content/automations", label: "Automations", icon: Workflow },
      ],
    },
    {
      label: "Recursos",
      items: [
        { href: "/manual", label: "Manual", icon: BookOpen },
        { href: "/configuracion", label: "Configuración", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="bg-gradient-to-b from-[#06091A] to-[#080D1F] border-r border-[var(--color-border)] p-[18px_14px] flex flex-col gap-[14px] sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-[11px] p-[4px_6px_14px] border-b border-[var(--color-border)]">
        <div className="w-[38px] h-[38px] rounded-[11px] grid place-items-center bg-gradient-to-br from-[var(--color-primary)] to-[#1A3FCC] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_rgba(43,91,255,0.45),0_0_0_1px_rgba(43,91,255,0.6)] relative overflow-hidden flex-shrink-0">
          <span className="font-[family-name:var(--font-display)] font-bold text-white text-[16px]">Z</span>
        </div>
        <div className="leading-[1.15]">
          <div className="text-[var(--color-text)] font-[family-name:var(--font-display)] font-semibold text-[15px] tracking-tight">Zecamo Studios</div>
          <div className="text-[var(--color-text-dim)] text-[11px] font-mono mt-[2px] tracking-wider">DASHBOARD · v2</div>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-[2px]">
          <div className="p-[10px_10px_4px] text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] font-medium">
            {g.label}
          </div>
          {g.items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href || (it.href !== "/" && pathname?.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "relative flex items-center gap-[11px] p-[9px_10px] rounded-[10px] text-[13.5px] font-normal transition-all duration-[140ms]",
                  active
                    ? "bg-gradient-to-r from-[rgba(43,91,255,0.18)] to-[rgba(43,91,255,0.04)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_rgba(43,91,255,0.25),0_0_16px_rgba(43,91,255,0.18)]"
                    : "text-[var(--color-text-muted)] hover:bg-white/[0.035] hover:text-[var(--color-text)]",
                )}
              >
                {active && (
                  <span className="absolute left-[-14px] top-[8px] bottom-[8px] w-[3px] bg-[var(--color-primary-hover)] rounded-r-[3px] shadow-[0_0_8px_var(--color-glow)]" />
                )}
                <Icon size={17} className={active ? "text-[var(--color-primary-hover)]" : "opacity-85"} />
                <span>{it.label}</span>
                {it.badge !== undefined && it.badge > 0 && (
                  <span className="ml-auto text-[10px] font-mono bg-[rgba(43,91,255,0.10)] text-[var(--color-primary-hover)] px-[6px] py-[1px] rounded font-medium">
                    {it.badge}
                  </span>
                )}
                {it.dot && it.badge === undefined && (
                  <span className="ml-auto w-[6px] h-[6px] rounded-full bg-[var(--color-primary-hover)] shadow-[0_0_8px_var(--color-glow)]" />
                )}
                {it.external && (
                  <span className="ml-auto opacity-45 font-mono text-[9px]">↗</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* User card */}
      <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-[10px] p-2 rounded-xl bg-white/[0.03] border border-[var(--color-border)]">
          <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[#1A3FCC] grid place-items-center text-white font-semibold text-[11.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex-shrink-0">
            JS
          </div>
          <div className="flex-1 min-w-0 leading-[1.2]">
            <div className="text-[var(--color-text)] text-[12.5px] font-medium">Joaco Sánchez</div>
            <div className="text-[var(--color-text-dim)] text-[11px]">Founder · Zecamo</div>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión" className="w-[26px] h-[26px] grid place-items-center bg-transparent border-0 text-[var(--color-text-dim)] cursor-pointer hover:text-[var(--color-text)] transition">
            <ChevronUp size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
