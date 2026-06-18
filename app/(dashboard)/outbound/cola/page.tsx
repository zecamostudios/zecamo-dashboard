import { LeadsQueue } from "@/components/outbound/LeadsQueue";
import { getPendingLeads, getLeadCounts } from "@/lib/db/leads";

export const dynamic = "force-dynamic";

export default async function ColaProspectosPage() {
  const [leads, counts] = await Promise.all([getPendingLeads(), getLeadCounts()]);
  return <LeadsQueue initialLeads={leads} counts={counts} />;
}
