import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TweaksDrawer } from "./TweaksDrawer";
import { createClient } from "@/lib/supabase/server";

interface DashboardShellProps {
  children: ReactNode;
}

async function getCounts() {
  try {
    const supabase = await createClient();
    const [tareasRes, prospectoRes] = await Promise.all([
      supabase.from("tareas").select("estado"),
      supabase.from("prospectos").select("etapa"),
    ]);

    const tareas = tareasRes.data ?? [];
    const prospectos = prospectoRes.data ?? [];

    const pendingTasks = tareas.filter((t) => t.estado !== "done").length;
    const inactive = ["venta", "noresp", "noventa", "seguim"];
    const activeProspects = prospectos.filter((p) => !inactive.includes(String(p.etapa))).length;

    return { pendingTasks, activeProspects };
  } catch {
    return { pendingTasks: 0, activeProspects: 0 };
  }
}

export async function DashboardShell({ children }: DashboardShellProps) {
  const { pendingTasks, activeProspects } = await getCounts();

  return (
    <div className="grid grid-cols-[252px_1fr] min-h-screen">
      <Sidebar tasksCount={pendingTasks} prospectsCount={activeProspects} />
      <main className="min-w-0 flex flex-col">
        <Topbar />
        <div className="px-8 py-7 pb-20 max-w-[1520px] w-full">{children}</div>
      </main>
      <TweaksDrawer />
    </div>
  );
}
