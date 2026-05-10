import { and, count, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { matches, seasons, teams } from "@/db/schema";
import { AppError, ErrorCode, ERROR_MESSAGES } from "@/lib/errors";
import { generateBracket, seedPlayoff } from "@/lib/bracket";
import { getPreviousStage, normalizeStagePlan } from "@/types/season";
import type { StageExecutor } from "./types";
import type { Database } from "brackets-manager";
import type { QualifiedTeam } from "@/types/season";
import type { Team } from "@/db/schema/teams";

// ── entry_round 映射 ──────────────────────────────────────────────────────────

const ENTRY_ROUNDS = [
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "final",
] as const;

function mapRoundToEntryRound(roundNumber: number, bracketSize: number): string | null {
  const totalRounds = Math.log2(bracketSize);
  if (roundNumber < 1 || roundNumber > totalRounds) return null;
  // round 1 → earliest entry round, round N → final
  const idx = Math.max(0, ENTRY_ROUNDS.length - totalRounds + roundNumber - 1);
  return ENTRY_ROUNDS[idx] ?? null;
}

// ── seeding 构建 ──────────────────────────────────────────────────────────────

/**
 * 从 qualifiers 构建 bracket seeding 数组。
 * 按 placement 分组 → 组间交叉排列（2nd-A, 3rd-B, 2nd-B, 3rd-A），
 * 1st 放在末尾以利用 brackets-manager 的 bye 填充。
 */
function buildSeedingFromQualifiers(
  qualifiers: QualifiedTeam[],
  teams: Team[],
): string[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // 按 placement 分组
  const byPlacement = new Map<string, QualifiedTeam[]>();
  for (const q of qualifiers) {
    const list = byPlacement.get(q.placement) ?? [];
    list.push(q);
    byPlacement.set(q.placement, list);
  }

  // 按 placement 优先级排序（非 "1st" 的在前，1st 在末尾享受 bye）
  const placements = [...byPlacement.keys()].sort((a, b) => {
    if (a === "1st") return 1;
    if (b === "1st") return -1;
    return a.localeCompare(b);
  });

  const seeding: string[] = [];
  for (const placement of placements) {
    const entries = byPlacement.get(placement)!;
    // 组内交叉：group A, B → 交错排列
    const sorted = [...entries].sort((a, b) => (a.group ?? "").localeCompare(b.group ?? ""));
    for (const entry of sorted) {
      const team = teamMap.get(entry.teamId);
      if (team) seeding.push(team.name);
    }
  }

  return seeding;
}

// ── executor ──────────────────────────────────────────────────────────────────

export const singleElimExecutor: StageExecutor = {
  async initialize(seasonId, config, teams, qualifiers) {
    const season = await db.query.seasons.findFirst({
      where: eq(seasons.id, seasonId),
    });
    if (!season) {
      throw new AppError(ErrorCode.SEASON_NOT_FOUND, ERROR_MESSAGES.SEASON_NOT_FOUND);
    }

    const stagePlan = normalizeStagePlan(season.stagePlan);
    const previousStage = getPreviousStage(stagePlan, config.key);

    // 计算 bracket 总轮数 → 用于 entry_round 映射
    const bracketSize = nextPowerOfTwo(config.teamCount);

    if (!previousStage) {
      // 首阶段：完整 bracket 生成
      const { data, resolvedMatches } = await generateBracket(teams, {
        qualifierFormat: null,
        playoffFormat: "single_elim",
        playoffName: config.name,
      });

      const bracketStages = data.stage as Array<{ id: number; name: string }>;
      const stageId = bracketStages.find((s) => s.name === config.name)?.id ?? null;
      let matchCount = 0;

      for (const bm of resolvedMatches) {
        if (stageId !== null && bm.stageId !== stageId) continue;
        const teamA = teams[bm.teamAParticipantId];
        const teamB = teams[bm.teamBParticipantId];
        if (!teamA || !teamB) continue;

        await db.insert(matches).values({
          seasonId,
          teamAId: teamA.id,
          teamBId: teamB.id,
          stage: config.key,
          format: config.matchFormat ?? "bo3",
          status: "scheduled",
          bracketNodeId: bm.bracketMatchId.toString(),
          entryRound: mapRoundToEntryRound(bm.roundNumber, bracketSize),
        });
        matchCount++;
      }

      await db
        .update(seasons)
        .set({ bracketData: data as Database, updatedAt: new Date() })
        .where(eq(seasons.id, seasonId));

      return { matchCount };
    }

    // 非首阶段：从 qualifiers 构建 seeding → seedPlayoff
    if (!season.bracketData) {
      throw new AppError(ErrorCode.SEASON_INVALID_STATUS, "请先一键生成赛程");
    }

    if (!qualifiers || qualifiers.length === 0) {
      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        `${previousStage.name} 没有晋级队伍，无法初始化 ${config.name}`,
      );
    }

    const seeding = buildSeedingFromQualifiers(qualifiers, teams);

    const { updatedData, resolvedMatches } = await seedPlayoff(
      seeding,
      season.bracketData as Database,
      config.name,
    );

    const nameToTeam = new Map(teams.map((t) => [t.name, t]));
    const participants = updatedData.participant as Array<{ id: number; name: string }>;
    const participantIdToTeam = new Map(
      participants.map((p) => [p.id, nameToTeam.get(p.name)]),
    );
    const bracketStages = updatedData.stage as Array<{ id: number; name: string }>;
    const stageId = bracketStages.find((s) => s.name === config.name)?.id ?? null;
    let matchCount = 0;

    for (const bm of resolvedMatches) {
      if (stageId === null || bm.stageId !== stageId) continue;
      const teamA = participantIdToTeam.get(bm.teamAParticipantId);
      const teamB = participantIdToTeam.get(bm.teamBParticipantId);
      if (!teamA || !teamB) continue;

      await db.insert(matches).values({
        seasonId,
        teamAId: teamA.id,
        teamBId: teamB.id,
        stage: config.key,
        format: config.matchFormat ?? "bo3",
        status: "scheduled",
        bracketNodeId: bm.bracketMatchId.toString(),
        entryRound: mapRoundToEntryRound(bm.roundNumber, bracketSize),
      });
      matchCount++;
    }

    await db
      .update(seasons)
      .set({ bracketData: updatedData as Database, updatedAt: new Date() })
      .where(eq(seasons.id, seasonId));

    return { matchCount };
  },

  async isComplete(seasonId, stageKey) {
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(matches)
      .where(and(eq(matches.seasonId, seasonId), eq(matches.stage, stageKey)));
    if (total === 0) return false;

    const [{ value: active }] = await db
      .select({ value: count() })
      .from(matches)
      .where(
        and(
          eq(matches.seasonId, seasonId),
          eq(matches.stage, stageKey),
          sql`${matches.status} in ('scheduled', 'in_progress')`,
        ),
      );
    return active === 0;
  },

  async getQualifiers(_seasonId, _config) {
    return [];
  },
};

/** 返回 ≥ n 的最小 2 的幂 */
function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}
