/**
 * Applies a migration SQL file to the Supabase project via the Management API.
 * Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/run-migration.mjs
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = "wlvogtjpldglpiufnryy";
const MIGRATION_FILE = path.join(__dirname, "../supabase/migrations/0009_prospectos_columns_and_content_os.sql");

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Error: SUPABASE_ACCESS_TOKEN environment variable not set.");
  console.error("Get your token at: https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const sql = readFileSync(MIGRATION_FILE, "utf-8");

console.log(`Running migration 0009 against project: ${PROJECT_REF}`);

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`Migration failed (${res.status}): ${body}`);
  process.exit(1);
}

const result = await res.json();
console.log("Migration applied successfully:", result);
