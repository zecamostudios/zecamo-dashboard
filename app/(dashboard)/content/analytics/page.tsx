import { ContentAnalyticsView } from "@/components/content/analytics/ContentAnalyticsView";

export const metadata = { title: "Analytics · Zecamo" };

export default function AnalyticsPage() {
  return <ContentAnalyticsView isMock={false} />;
}
