#!/usr/bin/env node
/**
 * Escapade DB Setup
 * Run: node scripts/setup.js
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const SCHEMA = path.join(ROOT, "prisma", "schema.prisma");
const opts = { stdio: "inherit", cwd: ROOT };

// Load .env.local into process.env so Prisma can read it
const envFile = path.join(ROOT, ".env.local");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
  console.log("✅ Loaded .env.local");
} else {
  console.warn("⚠️  No .env.local found — Prisma may fail without DATABASE_URL");
}

console.log("\n🚀 Escapade Setup");
console.log("📁 Project root:", ROOT, "\n");

// 1. Generate Prisma client
try {
  console.log("📦 Generating Prisma client...");
  execSync(`npx prisma generate --schema="${SCHEMA}"`, opts);
  console.log("✅ Prisma client generated\n");
} catch (e) {
  console.error("❌ prisma generate failed:", e.message);
  process.exit(1);
}

// 2. Push schema to DB
try {
  console.log("🗄️  Pushing schema to database...");
  // Pass env vars inline so Prisma CLI picks them up
  const env = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  };
  execSync(
    `npx prisma db push --schema="${SCHEMA}" --accept-data-loss`,
    { ...opts, env }
  );
  console.log("✅ Schema pushed to database\n");
} catch (e) {
  console.error("❌ DB push failed:", e.message);
  process.exit(1);
}

console.log("✅ Setup complete!");
console.log("👉 Run: npm run dev");
console.log("👉 Visit: http://localhost:3000");
console.log("👉 After login → Discover → Sync Events\n");
