import { NextResponse } from "next/server";
import { runDraftTimeoutCron } from "@/actions/draft";
import { validateCronAuth } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const authError = validateCronAuth(request);
  if (authError) return authError;

  const result = await runDraftTimeoutCron();
  return NextResponse.json(
    { ok: true, processed: result.picked + result.skipped, picked: result.picked, skipped: result.skipped },
  );
}
