import { createClient } from "@/lib/supabase/server";
import { AutomationsView } from "@/components/content/automations/AutomationsView";
import type { AutomationRun } from "@/lib/types";

export const metadata = { title: "Automations · Zecamo" };

export default async function AutomationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_automation_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return <AutomationsView recentRuns={(data ?? []) as AutomationRun[]} />;
}
