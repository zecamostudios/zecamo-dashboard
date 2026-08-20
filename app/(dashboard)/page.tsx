import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getDashboardStats } from "@/lib/db/dashboard";
import { getMeetings } from "@/lib/db/meetings";
import { getActivityLog } from "@/lib/db/activity";
import { getProjects } from "@/lib/db/projects";
import { getTasks } from "@/lib/db/tasks";
import { getProspects } from "@/lib/db/prospects";
import { getByLine } from "@/lib/db/finance";
import { getIngresosObjetivo } from "@/lib/db/config";

export default async function HomePage() {
  const [stats, meetings, activity, projects, tasks, prospects, byLine, monthTarget] = await Promise.all([
    getDashboardStats(),
    getMeetings(),
    getActivityLog(5),
    getProjects(),
    getTasks(),
    getProspects(),
    getByLine(),
    getIngresosObjetivo(),
  ]);

  return (
    <DashboardHome
      stats={stats}
      meetings={meetings}
      activity={activity}
      projects={projects}
      tasks={tasks}
      prospects={prospects}
      byLine={byLine}
      monthTarget={monthTarget}
    />
  );
}
