import { NextResponse } from "next/server";
import { runDraftTimeoutCron } from "@/actions/draft";

// Vercel Cron 每分钟触发（见 vercel.json）
// 安全：Authorization: Bearer ${CRON_SECRET}
// 逻辑：见 docs/draft-flow.md § Vercel Cron 超时自动 pick
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDraftTimeoutCron();
  return NextResponse.json(
    { ok: true, processed: result.picked + result.skipped, picked: result.picked, skipped: result.skipped },
  );
}
