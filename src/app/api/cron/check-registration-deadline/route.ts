import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { seasons } from "@/db/schema";
import { maybeAdvanceFromRegistration } from "@/actions/transitions";
import { validateCronAuth } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const authError = validateCronAuth(request);
  if (authError) return authError;

  const activeSeasons = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(eq(seasons.status, "registration"));

  let advanced = 0;

  for (const s of activeSeasons) {
    await db.transaction(async (tx) => {
      await maybeAdvanceFromRegistration(tx, s.id);
    });
    advanced++;
  }

  const skipped = activeSeasons.length - advanced;

  return NextResponse.json({ ok: true, advanced, skipped });
}
