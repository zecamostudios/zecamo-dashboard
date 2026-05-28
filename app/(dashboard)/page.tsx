import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getDashboardStats } from "@/lib/db/dashboard";
import { getMeetings } from "@/lib/db/meetings";
import { getActivityLog } from "@/lib/db/activity";
import { getProjects } from "@/lib/db/projects";
import { getTasks } from "@/lib/db/tasks";
import { getProspects } from "@/lib/db/prospects";

export default async function HomePage() {
  const [stats, meetings, activity, projects, tasks, prospects] = await Promise.all([
    getDashboardStats(),
    getMeetings(),
    getActivityLog(5),
    getProjects(),
    getTasks(),
    getProspects(),
  ]);

  return (
    <DashboardHome
      stats={stats}
      meetings={meetings}
      activity={activity}
      projects={projects}
      tasks={tasks}
      prospects={prospects}
    />
  );
}
