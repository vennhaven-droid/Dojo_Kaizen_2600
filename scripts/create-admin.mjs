/**
 * Create a Super Admin user via service role (bypasses dashboard UI).
 *
 * Usage:
 *   node scripts/create-admin.mjs vennhaven@gmail.com YourPassword123!
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing } = await admin.auth.admin.listUsers();
const found = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

let userId = found?.id;

if (!userId) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Create user failed:", error.message);
    console.error("\nRun supabase/migrations/0004_fix_auth_user_trigger.sql in SQL Editor first.");
    process.exit(1);
  }
  userId = data.user.id;
  console.log("Created auth user:", userId);
} else {
  console.log("Auth user already exists:", userId);
  const { error } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  if (error) console.warn("Could not update password:", error.message);
}

const { error: profileError } = await admin.from("profiles").upsert({
  id: userId,
  email,
  role: "SUPER_ADMIN",
  is_active: true,
});

if (profileError) {
  console.error("Profile upsert failed:", profileError.message);
  process.exit(1);
}

console.log("\nDone! Log in at /login → Coach / Admin");
console.log("  Email:", email);
console.log("  Password:", password);
console.log("  Role: SUPER_ADMIN");
