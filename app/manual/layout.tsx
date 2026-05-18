import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ManualSidebar } from "@/components/manual/manual-sidebar";

export const metadata = { title: "Manual · Zecamo Studios" };

export default async function ManualLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="zec-manual-root" data-zec-theme="dark">
      <ManualSidebar />
      <main className="zec-manual-main">{children}</main>
    </div>
  );
}
