"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
      <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle className="size-6 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold">Algo salió mal</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{error.message || "Ocurrió un error inesperado."}</p>
      <Button onClick={reset} variant="outline">Intentar de nuevo</Button>
    </div>
  );
}
