import { getAssets } from "@/lib/db/content/assets";
import { AssetsView } from "@/components/content/assets/AssetsView";

export const metadata = { title: "Assets · Zecamo" };

export default async function AssetsPage() {
  const assets = await getAssets();
  return <AssetsView initialAssets={assets} />;
}
