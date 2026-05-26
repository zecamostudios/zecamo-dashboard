import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TweaksDrawer } from "./TweaksDrawer";
import { TASKS, PROSPECTS } from "@/lib/mock-data";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  // TODO: reemplazar por queries reales a Supabase
  const pendingTasks = TASKS.filter((t) => t.status !== "hecho").length;
  const activeProspects = PROSPECTS.filter(
    (p) => !["venta", "noresp", "noventa", "seguim"].includes(p.stage),
  ).length;

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
