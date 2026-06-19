#!/usr/bin/env node
/**
 * One-off schema push script.
 * Works around prisma.config.ts blocking env var loading.
 * Uses session-mode pooler (port 5432) which supports DDL.
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const envFile = path.join(ROOT, ".env.local");

// Parse .env.local manually
const env = { ...process.env };
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
  }
  console.log("✅ Loaded .env.local");
}

// Use session-mode pooler (port 5432) for DIRECT_URL — supports DDL unlike transaction mode (6543)
// Format: postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres
const poolerBase = env.DATABASE_URL
  ? env.DATABASE_URL.replace(":6543/", ":5432/")
  : null;

if (poolerBase) {
  env.DIRECT_URL = poolerBase;
  console.log("ℹ️  Using session-mode pooler for DIRECT_URL (port 5432)");
}

console.log("DATABASE_URL set:", !!env.DATABASE_URL);
console.log("DIRECT_URL set:", !!env.DIRECT_URL);

try {
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    cwd: ROOT,
    env,
  });
  console.log("\n✅ Schema pushed successfully!");
} catch (e) {
  console.error("\n❌ Push failed");
  process.exit(1);
}
