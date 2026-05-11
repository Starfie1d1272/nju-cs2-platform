import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const rawUrl = process.env.DATABASE_URL;

/**
 * Rewrite Supabase direct-connection URLs to Transaction Pooler (port 6543)
 * via known IP, bypassing Geo-fenced DNS on Vercel.
 * SSL is disabled on the pooler — it's terminated at the PgBouncer level.
 */
function toPoolerUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "db.feontmsggbbligghjrhl.supabase.co") {
      parsed.hostname = "198.18.8.125";
      parsed.port = "6543";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const connectionString = rawUrl ? toPoolerUrl(rawUrl) : rawUrl;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pgConfig: any = {
  connectionString,
  ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  family: 4,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};
const pool = new Pool(pgConfig);

// Prevent pool-level errors from crashing the Next.js process
pool.on("error", (err) => {
  console.error("[db] pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;

function shouldUseSsl(databaseUrl?: string): boolean {
  if (!databaseUrl) return false;

  try {
    const url = new URL(databaseUrl);
    if (url.searchParams.get("sslmode") === "disable") return false;
    // Pooler terminates SSL at its level
    if (url.port === "6543") return false;
    return !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    console.error("[db] malformed DATABASE_URL, defaulting to SSL enabled");
    return true;
  }
}
