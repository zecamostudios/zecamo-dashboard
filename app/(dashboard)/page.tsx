import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getDashboardStats } from "@/lib/db/dashboard";
import { getMeetings } from "@/lib/db/meetings";
import { getTasks } from "@/lib/db/tasks";
import { getProspects } from "@/lib/db/prospects";
import { getIngresosObjetivo } from "@/lib/db/config";

export default async function HomePage() {
  // Cuatro queries en vez de ocho: se fueron las de actividad, proyectos y
  // distribucion por linea junto con los widgets que las usaban.
  const [stats, meetings, tasks, prospects, monthTarget] = await Promise.all([
    getDashboardStats(),
    getMeetings(),
    getTasks(),
    getProspects(),
    getIngresosObjetivo(),
  ]);

  return (
    <DashboardHome
      stats={stats}
      meetings={meetings}
      tasks={tasks}
      prospects={prospects}
      monthTarget={monthTarget}
    />
  );
}
