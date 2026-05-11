import { describe, expect, it } from "vitest";
import {
  createMatchSchema,
  recordMatchResultSchema,
} from "@/lib/validators/match";

const UUID_A = "00000000-0000-0000-0000-000000000001";
const UUID_B = "00000000-0000-0000-0000-000000000002";
const UUID_MATCH = "00000000-0000-0000-0000-000000000003";

describe("createMatchSchema", () => {
  it("接受合法输入", () => {
    const r = createMatchSchema.safeParse({
      seasonId: UUID_A,
      teamAId: UUID_A,
      teamBId: UUID_B,
      stage: "qualifier",
    });
    expect(r.success).toBe(true);
    expect(r.data?.format).toBe("bo1");
  });

  it("默认 format 为 bo1", () => {
    const r = createMatchSchema.safeParse({
      seasonId: UUID_A,
      teamAId: UUID_A,
      teamBId: UUID_B,
      stage: "playoff",
    });
    expect(r.success).toBe(true);
  });

  it("拒绝非法 stage", () => {
    const r = createMatchSchema.safeParse({
      seasonId: UUID_A,
      teamAId: UUID_A,
      teamBId: UUID_B,
      stage: "invalid",
    });
    expect(r.success).toBe(false);
  });

  it("拒绝非法 format", () => {
    const r = createMatchSchema.safeParse({
      seasonId: UUID_A,
      teamAId: UUID_A,
      teamBId: UUID_B,
      stage: "qualifier",
      format: "bo7",
    });
    expect(r.success).toBe(false);
  });

  it("接受合法 scheduledAt", () => {
    const r = createMatchSchema.safeParse({
      seasonId: UUID_A,
      teamAId: UUID_A,
      teamBId: UUID_B,
      stage: "qualifier",
      scheduledAt: "2026-06-01T14:00:00.000Z",
    });
    expect(r.success).toBe(true);
  });

  it("拒绝非法 UUID", () => {
    const r = createMatchSchema.safeParse({
      seasonId: "not-uuid",
      teamAId: UUID_A,
      teamBId: UUID_B,
      stage: "qualifier",
    });
    expect(r.success).toBe(false);
  });
});

describe("recordMatchResultSchema", () => {
  it("接受合法比分", () => {
    const r = recordMatchResultSchema.safeParse({
      matchId: UUID_MATCH,
      scoreA: 2,
      scoreB: 0,
    });
    expect(r.success).toBe(true);
  });

  it("拒绝负数比分", () => {
    const r = recordMatchResultSchema.safeParse({
      matchId: UUID_MATCH,
      scoreA: -1,
      scoreB: 0,
    });
    expect(r.success).toBe(false);
  });

  it("接受带地图详情的输入 (BO3 已完成)", () => {
    const r = recordMatchResultSchema.safeParse({
      matchId: UUID_MATCH,
      scoreA: 2,
      scoreB: 1,
      maps: [
        {
          mapOrder: 1,
          mapName: "Mirage",
          pickedByTeamId: UUID_A,
          teamAStartSide: "t",
          scoreA: 1,
          scoreB: 0,
        },
        {
          mapOrder: 2,
          mapName: "Inferno",
          pickedByTeamId: UUID_B,
          teamAStartSide: "ct",
          scoreA: 0,
          scoreB: 1,
        },
        {
          mapOrder: 3,
          mapName: "Nuke",
          pickedByTeamId: null,
          teamAStartSide: null,
          scoreA: 1,
          scoreB: 0,
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("拒绝地图分数为负数", () => {
    const r = recordMatchResultSchema.safeParse({
      matchId: UUID_MATCH,
      scoreA: 2,
      scoreB: 1,
      maps: [
        { mapOrder: 1, mapName: "Mirage", scoreA: -1, scoreB: 0 },
      ],
    });
    expect(r.success).toBe(false);
  });

  it("拒绝地图顺序超出 1-5", () => {
    const r = recordMatchResultSchema.safeParse({
      matchId: UUID_MATCH,
      scoreA: 2,
      scoreB: 1,
      maps: [
        { mapOrder: 6, mapName: "Mirage", scoreA: 1, scoreB: 0 },
      ],
    });
    expect(r.success).toBe(false);
  });
});
