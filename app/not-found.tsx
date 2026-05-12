import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <p className="text-7xl font-black text-slate-200">404</p>
        <h1 className="text-xl font-bold text-slate-800">Página no encontrada</h1>
        <p className="text-sm text-muted-foreground">La ruta que buscás no existe o fue eliminada.</p>
        <Link href="/"><Button>Volver al dashboard</Button></Link>
      </div>
    </div>
  );
}
