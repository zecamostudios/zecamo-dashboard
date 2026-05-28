import { TareasView } from "@/components/tareas/TareasView";
import { getTasks } from "@/lib/db/tasks";

export default async function TareasPage() {
  const tasks = await getTasks();
  return <TareasView initialTasks={tasks} />;
}
