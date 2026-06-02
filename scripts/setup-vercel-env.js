#!/usr/bin/env node
/**
 * Agrega las variables de entorno de Zecamo al proyecto Vercel.
 * Uso: VERCEL_TOKEN=tu_token node scripts/setup-vercel-env.js
 *
 * Cómo obtener el token:
 *   1. https://vercel.com/account/tokens  → Create Token
 *   2. VERCEL_TOKEN=xxx node scripts/setup-vercel-env.js
 */
const https = require("https");

const TOKEN      = process.env.VERCEL_TOKEN;
const PROJECT    = "zecamo-dashboard";   // nombre del proyecto en Vercel
const TEAM_SLUG  = process.env.VERCEL_TEAM ?? "";

if (!TOKEN) {
  console.error("❌  Falta VERCEL_TOKEN. Generalo en https://vercel.com/account/tokens");
  process.exit(1);
}

// Fill values from .env.local or team password manager
const ENV_VARS = [
  { key: "ZERNIO_API_KEY",       value: process.env.ZERNIO_API_KEY       ?? "REPLACE_ME", type: "encrypted" },
  { key: "NEXT_PUBLIC_SITE_URL", value: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dashboardzecamostudios.vercel.app", type: "plain" },
  { key: "OPENAI_API_KEY",       value: process.env.OPENAI_API_KEY       ?? "REPLACE_ME", type: "sensitive" },
];

async function getProjectId() {
  return new Promise((resolve, reject) => {
    const path = `/v9/projects/${PROJECT}${TEAM_SLUG ? `?teamId=${TEAM_SLUG}` : ""}`;
    const req = https.request(
      { hostname: "api.vercel.com", path, method: "GET", headers: { Authorization: `Bearer ${TOKEN}` } },
      (res) => {
        let b = ""; res.on("data", d => b += d);
        res.on("end", () => {
          const d = JSON.parse(b);
          if (d.id) resolve(d.id);
          else reject(new Error(`Project not found: ${JSON.stringify(d).slice(0, 200)}`));
        });
      }
    );
    req.on("error", reject); req.end();
  });
}

async function addEnvVar(projectId, { key, value, type }) {
  const payload = JSON.stringify({
    key,
    value,
    type,
    target: ["production", "preview", "development"],
  });
  return new Promise((resolve) => {
    const path = `/v10/projects/${projectId}/env${TEAM_SLUG ? `?teamId=${TEAM_SLUG}` : ""}`;
    const req = https.request(
      {
        hostname: "api.vercel.com", path, method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
      },
      (res) => {
        let b = ""; res.on("data", d => b += d);
        res.on("end", () => {
          const d = JSON.parse(b);
          if (d.createdAt || d.id) console.log(`  ✅  ${key}`);
          else if (d.error?.code === "ENV_ALREADY_EXISTS") console.log(`  ⏭️   ${key} (ya existe)`);
          else console.log(`  ❌  ${key}: ${JSON.stringify(d).slice(0, 100)}`);
          resolve();
        });
      }
    );
    req.on("error", (e) => { console.log(`  ❌  ${key}: ${e.message}`); resolve(); });
    req.write(payload); req.end();
  });
}

(async () => {
  console.log(`\n🔧  Configurando env vars en Vercel (proyecto: ${PROJECT})\n`);
  const projectId = await getProjectId();
  console.log(`📦  Project ID: ${projectId}\n`);
  for (const v of ENV_VARS) await addEnvVar(projectId, v);
  console.log(`\n✅  Listo. Hacé un redeploy en Vercel para aplicar los cambios.\n`);
})().catch(console.error);
