import { ProyectosView } from "@/components/proyectos/ProyectosView";
import { getProjects } from "@/lib/db/projects";

export default async function ProyectosPage() {
  const projects = await getProjects();
  return <ProyectosView initialProjects={projects} />;
}
