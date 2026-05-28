import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROSPECTS, STAGES } from "@/lib/mock-data";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import { Pill } from "@/components/ui-zecamo/Pill";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button } from "@/components/ui-zecamo/Button";
import type { Prospect } from "@/lib/types";

interface ProspectsRecentProps {
  prospects?: Prospect[];
}

export function ProspectsRecent({ prospects: initialProspects }: ProspectsRecentProps) {
  const prospects = (initialProspects ?? PROSPECTS).slice(0, 5);

  return (
    <Card>
      <CardHead>
        <CardTitle big>Prospectos recientes</CardTitle>
        <Link href="/crm">
          <Button variant="ghost" className="text-xs">
            Ver todos <ArrowRight size={12} />
          </Button>
        </Link>
      </CardHead>
      {prospects.map((p) => (
        <div key={p.id} className="flex items-center gap-2.5 py-2.5 border-b border-[var(--color-border)]">
          <OwnerAvatar id={p.owner} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[var(--color-text)] truncate">{p.name}</div>
            <div className="text-[11.5px] text-[var(--color-text-muted)] truncate">
              {p.company} · <span className="text-[var(--color-primary-hover)]">{p.line}</span>
            </div>
          </div>
          <Pill variant={p.stage} dot>{STAGES.find((s) => s.id === p.stage)?.label}</Pill>
        </div>
      ))}
    </Card>
  );
}
