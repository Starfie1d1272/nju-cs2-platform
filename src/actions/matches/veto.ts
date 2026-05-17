"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { matchVetoSteps, matchMaps, matches, auditLogs } from "@/db/schema";
import { ok, type ActionResult } from "@/types/action";
import { AppError, ErrorCode } from "@/lib/errors";
import { requireSeasonAdmin, auditActorId } from "@/lib/auth/session";
import { getMatchOrThrow, actionError } from "@/lib/action-utils";
import { revalidateMatchPaths } from "@/lib/revalidation";
import type { VetoActionType } from "@/types/match";

export interface VetoStepInput {
  actionType: VetoActionType;
  mapName: string;
  teamId: string | null;
  side?: "t" | "ct" | null;
}

export async function saveVetoSteps(
  matchId: string,
  steps: VetoStepInput[],
): Promise<ActionResult<void>> {
  try {
    const match = await getMatchOrThrow(matchId);
    const session = await requireSeasonAdmin(match.seasonId);

    if (match.status !== "scheduled") {
      throw new AppError(
        ErrorCode.MATCH_INVALID_TRANSITION,
        "仅 scheduled 状态的比赛可录入 BP",
      );
    }

    if (steps.length === 0) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, "BP 步骤不能为空");
    }

    await db.transaction(async (tx) => {
      // 清除旧记录（支持重复录入）
      await tx
        .delete(matchVetoSteps)
        .where(eq(matchVetoSteps.matchId, matchId));

      // 写入 BP 步骤
      await tx.insert(matchVetoSteps).values(
        steps.map((s, i) => ({
          matchId,
          stepOrder: i + 1,
          actionType: s.actionType,
          mapName: s.mapName,
          teamId: s.teamId,
          side: s.side ?? null,
        })),
      );

      // 从 pick / decider 步骤自动创建 match_maps 记录
      const playMaps = steps.filter(
        (s) => s.actionType === "pick" || s.actionType === "decider",
      );

      await tx.delete(matchMaps).where(eq(matchMaps.matchId, matchId));

      let mapOrder = 1;
      for (const s of playMaps) {
        await tx.insert(matchMaps).values({
          matchId,
          mapOrder: mapOrder++,
          mapName: s.mapName,
          pickedByTeamId: s.actionType === "pick" ? s.teamId : null,
          teamAStartSide: s.side ?? null,
        });
      }

      await tx.insert(auditLogs).values({
        seasonId: match.seasonId,
        action: "match.save_veto",
        actorId: auditActorId(session),
        targetId: matchId,
        targetType: "match",
        meta: { format: match.format, stepCount: steps.length },
      });
    });

    const season = await db.query.seasons.findFirst({
      where: (t, { eq: e }) => e(t.id, match.seasonId),
    });
    if (season) revalidateMatchPaths(season.slug, matchId);

    return ok(undefined);
  } catch (e) {
    return actionError("saveVetoSteps", e);
  }
}
