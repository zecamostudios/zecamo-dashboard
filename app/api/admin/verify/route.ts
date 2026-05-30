import { NextRequest, NextResponse } from "next/server";
import { requireAdminSecret } from "@/lib/supabase/auth-guard";
import { createClient } from "@/lib/supabase/server";

const CONTENT_OS_TABLES = [
  "content_posts",
  "content_ai_generations",
  "content_assets",
  "content_planner",
  "content_automation_runs",
  "brand_memory",
  "analytics_snapshots",
  "platform_accounts",
  "publishing_jobs",
  "workflow_events",
];

export async function GET(req: NextRequest) {
  if (!requireAdminSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const tableStatus: Record<string, { exists: boolean; count?: number; error?: string }> = {};

  await Promise.all(
    CONTENT_OS_TABLES.map(async (table) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count, error } = await (supabase as any)
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        tableStatus[table] = { exists: false, error: error.message };
      } else {
        tableStatus[table] = { exists: true, count: count ?? 0 };
      }
    }),
  );

  const allExist = Object.values(tableStatus).every((s) => s.exists);
  const missingTables = Object.entries(tableStatus)
    .filter(([, s]) => !s.exists)
    .map(([t]) => t);

  return NextResponse.json({
    ok: allExist,
    tables: tableStatus,
    missingTables,
    summary: allExist
      ? "All Content OS tables exist"
      : `Missing ${missingTables.length} table(s): ${missingTables.join(", ")}`,
    migrationFile: "supabase/migrations/APPLY_CONTENT_OS.sql",
  });
}
