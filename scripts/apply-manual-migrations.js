#!/usr/bin/env node
/**
 * apply-manual-migrations.js
 *
 * Aplica las migraciones del Manual Operativo a Supabase.
 * Uso:
 *   node scripts/apply-manual-migrations.js
 *
 * Requiere la variable DB_URL en .env.local:
 *   DB_URL=postgresql://postgres:[PASSWORD]@db.wlvogtjpldglpiufnryy.supabase.co:5432/postgres
 *
 * Podés conseguir el DB_URL en:
 *   Supabase Dashboard → Settings → Database → Connection string → URI
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load env
const envFile = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envFile, "utf8");
const dbUrlMatch = envContent.match(/^DB_URL=(.+)$/m);

if (!dbUrlMatch) {
  console.error("❌ No se encontró DB_URL en .env.local");
  console.error("");
  console.error("Agregá esto a .env.local:");
  console.error("DB_URL=postgresql://postgres:[PASSWORD]@db.wlvogtjpldglpiufnryy.supabase.co:5432/postgres");
  console.error("");
  console.error("Podés obtener el password en:");
  console.error("Supabase Dashboard → Settings → Database → Database password");
  process.exit(1);
}

const dbUrl = dbUrlMatch[1].trim();
const migrations = [
  "0006_manual_schema.sql",
  "0007_manual_seed.sql",
  "0008_manual_blocks.sql",
];

const migrationsDir = path.join(__dirname, "..", "supabase", "migrations");

console.log("🚀 Aplicando migraciones del Manual Operativo...\n");

for (const file of migrations) {
  const filePath = path.join(migrationsDir, file);
  console.log(`→ ${file}...`);
  try {
    execSync(`psql "${dbUrl}" -f "${filePath}"`, { stdio: "pipe" });
    console.log(`  ✅ OK`);
  } catch (err) {
    const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
    if (output.includes("already exists") || output.includes("duplicate")) {
      console.log(`  ⚠️  Ya existía (idempotente, OK)`);
    } else {
      console.error(`  ❌ Error:\n${output}`);
    }
  }
}

console.log("\n✅ Listo. Verificá en el SQL Editor de Supabase:");
console.log("   SELECT count(*) FROM public.manual_sections;  → debe dar 8");
console.log("   SELECT count(*) FROM public.principles;       → debe dar 7");
console.log("   SELECT count(*) FROM public.manual_blocks;    → debe dar 60+");
