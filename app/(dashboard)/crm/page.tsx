import { CrmView } from "@/components/crm/CrmView";
import { getProspects } from "@/lib/db/prospects";

export default async function CrmPage() {
  const prospects = await getProspects();
  return <CrmView initialProspects={prospects} />;
}
