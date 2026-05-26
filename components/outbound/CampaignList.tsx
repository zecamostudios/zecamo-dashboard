import { Inbox, Plus, Send } from "lucide-react";
import { Card, CardHead, CardTitle } from "@/components/ui-zecamo/Card";
import { Button } from "@/components/ui-zecamo/Button";
import { Pill } from "@/components/ui-zecamo/Pill";
import { OwnerAvatar } from "@/components/ui-zecamo/OwnerAvatar";
import type { Template } from "@/lib/types";

interface CampaignListProps {
  templates: Template[];
}

export function CampaignList({ templates }: CampaignListProps) {
  return (
    <Card>
      <CardHead>
        <CardTitle big icon={<Inbox size={16} />}>Templates · biblioteca</CardTitle>
        <Button variant="primary" className="px-3 py-1.5"><Plus size={13} />Nuevo template</Button>
      </CardHead>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            <tr>
              <th className="py-2.5 font-medium">Template</th>
              <th className="py-2.5 font-medium">Línea</th>
              <th className="py-2.5 font-medium">Owner</th>
              <th className="py-2.5 font-medium">Usos</th>
              <th className="py-2.5 font-medium">Reply rate</th>
              <th className="py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => {
              const good = t.reply > 0.2;
              return (
                <tr key={t.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="py-3 font-medium">{t.name}</td>
                  <td className="py-3"><Pill variant={t.line}>{t.line}</Pill></td>
                  <td className="py-3"><OwnerAvatar id={t.owner} size="xs" /></td>
                  <td className="py-3 font-mono">{t.uses}</td>
                  <td className="py-3 w-[180px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/[0.05] rounded-full overflow-hidden" style={{ height: 4 }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, t.reply * 200)}%`,
                            background: good
                              ? "linear-gradient(90deg, var(--color-success), #4FE0AA)"
                              : "linear-gradient(90deg, var(--color-warning), #FFC459)",
                          }}
                        />
                      </div>
                      <span
                        className="font-mono text-[11.5px] w-9 text-right font-semibold"
                        style={{ color: good ? "var(--color-success)" : "var(--color-warning)" }}
                      >
                        {Math.round(t.reply * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3"><Button variant="ghost" className="px-2 py-1"><Send size={11} />Usar</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
