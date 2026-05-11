import { NextResponse } from "next/server";
import dns from "dns/promises";

export const dynamic = "force-dynamic";

export async function GET() {
  const hostname = "db.feontmsggbbligghjrhl.supabase.co";
  const results: Record<string, unknown> = { hostname };

  // 1. System resolver (dns.resolve4)
  try {
    results.systemIp4 = (await dns.resolve4(hostname)).join(", ");
  } catch (e) {
    results.systemIp4 = `FAIL: ${(e as Error).message}`;
  }

  // 2. dns.lookup (uses system resolver, different code path)
  try {
    const { address } = await dns.lookup(hostname, { family: 4 });
    results.lookupIp = address;
  } catch (e) {
    results.lookupIp = `FAIL: ${(e as Error).message}`;
  }

  // 3. Custom resolver with Google DNS
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(["8.8.8.8"]);
    results.googleIp4 = (await resolver.resolve4(hostname)).join(", ");
  } catch (e) {
    results.googleIp4 = `FAIL: ${(e as Error).message}`;
  }

  // 4. Try resolving supabase.com to see if domain works at all
  try {
    results.supabaseCom = (await dns.resolve4("supabase.com")).join(", ");
  } catch (e) {
    results.supabaseCom = `FAIL: ${(e as Error).message}`;
  }

  // 5. DATABASE_URL availability
  results.hasDatabaseUrl = !!process.env.DATABASE_URL;

  return NextResponse.json(results);
}
