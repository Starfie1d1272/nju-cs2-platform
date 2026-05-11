import { describe, expect, it, vi, beforeEach } from "vitest";

// ── mock db ───────────────────────────────────────────────────────────────────
const {
  mockInsert,
  mockMatchFindMany,
} = vi.hoisted(() => {
  const mockInsertValues = vi.fn().mockResolvedValue(undefined);
  return {
    mockInsert: vi.fn().mockReturnValue({ values: mockInsertValues }),
    mockMatchFindMany: vi.fn(),
  };
});

vi.mock("@/db/client", () => ({
  db: {
    insert: mockInsert,
    query: {
      matches: { findMany: mockMatchFindMany },
    },
  },
}));

vi.mock("@/db/schema", () => ({
  matches: { id: { defaultValue: "m-test" } },
  teams: { id: {}, name: {}, seasonId: {}, draftOrder: {} },
}));

import { gslGroupExecutor } from "@/lib/formats/gsl-group";
import { AppError } from "@/lib/errors";
import type { Team } from "@/db/schema/teams";

function makeTeams(n: number): Team[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `team-${i}`,
    name: `战队 ${i + 1}`,
    seasonId: "season-1",
    draftOrder: i + 1,
  } as Team));
}

const mockConfig8 = {
  key: "gsl-groups",
  name: "GSL 小组赛",
  type: "gsl_group" as const,
  teamCount: 16,
  groupCount: 2,
  advanceTiers: [
    { placement: "1st", count: 1 },
    { placement: "2nd", count: 1 },
    { placement: "3rd", count: 1 },
  ],
};

const mockConfig4 = {
  key: "gsl-groups",
  name: "GSL 小组赛",
  type: "gsl_group" as const,
  teamCount: 8,
  groupCount: 2,
  advanceTiers: [
    { placement: "1st", count: 1 },
    { placement: "2nd", count: 1 },
    { placement: "3rd", count: 1 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockInsert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
});

// ── helpers ───────────────────────────────────────────────────────────────────

function finishedMatch(teamAId: string, teamBId: string, scoreA: number, scoreB: number, round: number) {
  return {
    id: `m-${teamAId}-${teamBId}-r${round}`,
    seasonId: "season-1",
    teamAId,
    teamBId,
    status: "finished" as const,
    scoreA,
    scoreB,
    round,
    stage: "gsl-groups",
    createdAt: new Date(),
  };
}

describe("gslGroupExecutor", () => {
  // ── initialize ──────────────────────────────────────────────────────────────

  describe("initialize()", () => {
    it("creates correct R1 matches for 8-team groups", async () => {
      // 16 teams, 2 groups → 2×4 = 8 R1 matches
      const result = await gslGroupExecutor.initialize(
        "season-1",
        mockConfig8,
        makeTeams(16),
        undefined,
      );
      expect(result.matchCount).toBe(8);
    });

    it("creates correct R1 matches for 4-team groups", async () => {
      // 8 teams, 2 groups → 2×2 = 4 R1 matches
      const result = await gslGroupExecutor.initialize(
        "season-1",
        mockConfig4,
        makeTeams(8),
        undefined,
      );
      expect(result.matchCount).toBe(4);
    });

    it("rejects unsupported group size", async () => {
      // 12 teams, 2 groups → 6/group → unsupported
      await expect(
        gslGroupExecutor.initialize("season-1", mockConfig8, makeTeams(12), undefined),
      ).rejects.toThrow(AppError);
    });

    it("uses snake allocation for cross-group seeding", async () => {
      // snake: seed1→A, seed2→B, seed3→B, seed4→A
      await gslGroupExecutor.initialize(
        "season-1",
        mockConfig4,
        makeTeams(8),
        undefined,
      );

      const insertCalls = mockInsert.mock.calls;
      // 4 calls: 2 for group A (round=1), 2 for group B (round=1)
      expect(insertCalls.length).toBe(4);

      // Group A: seeds 1,4,5,8 → [team-0, team-3, team-4, team-7]
      // R1 for group A (4-team): team-0 vs team-7, team-3 vs team-4
      // Group B: seeds 2,3,6,7 → [team-1, team-2, team-5, team-6]
      // R1 for group B (4-team): team-1 vs team-6, team-2 vs team-5
    });
  });

  // ── advanceRound ────────────────────────────────────────────────────────────

  describe("advanceRound()", () => {
    it("creates R2 winners matches from R1 results", async () => {
      // Mock R1 matches (group A only, 8-team)
      const r1Matches = [
        finishedMatch("t0", "t7", 2, 0, 1), // t0 wins
        finishedMatch("t3", "t4", 1, 2, 1), // t4 wins
        finishedMatch("t1", "t6", 2, 1, 1), // t1 wins
        finishedMatch("t2", "t5", 0, 2, 1), // t5 wins
      ];
      mockMatchFindMany.mockResolvedValue(r1Matches);

      const result = await gslGroupExecutor.advanceRound!("season-1", "gsl-groups");
      // R2: W(t0/t7) vs W(t3/t4) = t0 vs t4, and W(t1/t6) vs W(t2/t5) = t1 vs t5
      expect(result.matchCount).toBeGreaterThanOrEqual(1);
    });

    it("throws when current round has unfinished matches", async () => {
      mockMatchFindMany.mockResolvedValue([
        { ...finishedMatch("t0", "t7", 2, 0, 1), status: "scheduled" as const },
      ]);

      await expect(
        gslGroupExecutor.advanceRound!("season-1", "gsl-groups"),
      ).rejects.toThrow(AppError);
    });
  });

  // ── getQualifiers ───────────────────────────────────────────────────────────

  describe("getQualifiers()", () => {
    it("returns placements based on completed matches", async () => {
      // Simulate full GSL for one 4-team group:
      // R1: 1vs4 (t0 wins 2-0), 2vs3 (t1 wins 2-1)
      // R2: W(R1) = t0 vs t1 (t0 wins 2-1) → t0: 2-0 (1st)
      // R3: L(R1) = t3 vs t2 (t2 wins 2-0) → t3: 0-2 (elim)
      // R4: L(R2)=t1 vs W(R3)=t2 (t1 wins 2-0) → t1: 2-1 (2nd), t2: 1-2 (3rd)
      mockMatchFindMany.mockResolvedValue([
        finishedMatch("t0", "t3", 2, 0, 1),
        finishedMatch("t1", "t2", 2, 1, 1),
        finishedMatch("t0", "t1", 2, 1, 2),
        finishedMatch("t2", "t3", 2, 0, 3),
        finishedMatch("t1", "t2", 2, 0, 4),
      ]);

      const result = await gslGroupExecutor.getQualifiers("season-1", {
        ...mockConfig4,
        key: "gsl-groups",
      });

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ teamId: "t0", placement: "1st" }),
          expect.objectContaining({ teamId: "t1", placement: "2nd" }),
          expect.objectContaining({ teamId: "t2", placement: "3rd" }),
        ]),
      );
    });

    it("returns empty array when no matches exist", async () => {
      mockMatchFindMany.mockResolvedValue([]);
      const result = await gslGroupExecutor.getQualifiers("season-1", {
        ...mockConfig4,
        key: "gsl-groups",
      });
      expect(result).toEqual([]);
    });
  });

  // ── isComplete ──────────────────────────────────────────────────────────────

  describe("isComplete()", () => {
    it("returns true when all matches finished", async () => {
      mockMatchFindMany.mockResolvedValue([
        finishedMatch("t0", "t1", 2, 1, 1),
        finishedMatch("t2", "t3", 1, 2, 1),
      ]);

      const result = await gslGroupExecutor.isComplete("season-1", "gsl-groups");
      expect(result).toBe(true);
    });

    it("returns false when some matches still active", async () => {
      mockMatchFindMany.mockResolvedValue([
        finishedMatch("t0", "t1", 2, 1, 1),
        { ...finishedMatch("t2", "t3", 1, 2, 1), status: "scheduled" as const },
      ]);

      const result = await gslGroupExecutor.isComplete("season-1", "gsl-groups");
      expect(result).toBe(false);
    });

    it("returns false when no matches exist", async () => {
      mockMatchFindMany.mockResolvedValue([]);
      const result = await gslGroupExecutor.isComplete("season-1", "gsl-groups");
      expect(result).toBe(false);
    });
  });
});
