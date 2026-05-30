import { getBrandMemory } from "@/lib/db/content/brand-memory";
import { BrandMemoryView } from "@/components/content/brand-memory/BrandMemoryView";

export const metadata = { title: "Brand Memory · Zecamo" };

export default async function BrandMemoryPage() {
  const memory = await getBrandMemory();
  return <BrandMemoryView initialMemory={memory} />;
}
