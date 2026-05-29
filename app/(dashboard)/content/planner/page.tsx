import { getPlannerSlots } from "@/lib/db/content/planner";
import { PlannerView } from "@/components/content/planner/PlannerView";

export const metadata = { title: "Planner · Zecamo" };

export default async function PlannerPage() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const slots = await getPlannerSlots(
    monday.toISOString().slice(0, 10),
    sunday.toISOString().slice(0, 10),
  );

  return <PlannerView initialSlots={slots} />;
}
