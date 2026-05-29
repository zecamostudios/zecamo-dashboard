"use client";

import { useState } from "react";
import { ExternalLink, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHead } from "@/components/ui-zecamo/PageHead";
import { Button } from "@/components/ui-zecamo/Button";
import { PricingCalculator, type ServiceId, type Size } from "./PricingCalculator";

export function CalculadoraView() {
  const router = useRouter();
  const [service, setService] = useState<ServiceId>("Webs");
  const [size, setSize] = useState<Size>("medio");
  const [scope, setScope] = useState<number>(3);
  const [diagTier, setDiagTier] = useState<"Express" | "Premium">("Express");
  const [rush, setRush] = useState<boolean>(false);

  return (
    <>
      <PageHead
        title={<>Calculadora <em className="text-[var(--color-text-muted)] not-italic font-normal">· de pricing</em></>}
        subtitle="Estimá rangos de precio y modelo de cobro para una propuesta nueva."
        actions={
          <>
            <Button onClick={() => window.print()}>
              <ExternalLink size={12} />Exportar PDF
            </Button>
            <Button variant="primary" onClick={() => router.push("/crm")}>
              <Send size={12} />Crear propuesta
            </Button>
          </>
        }
      />

      <PricingCalculator
        service={service}
        setService={setService}
        size={size}
        setSize={setSize}
        scope={scope}
        setScope={setScope}
        diagTier={diagTier}
        setDiagTier={setDiagTier}
        rush={rush}
        setRush={setRush}
      />
    </>
  );
}
