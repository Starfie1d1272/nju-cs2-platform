import { describe, expect, it } from "vitest";
import {
  castVoteSchema,
  retractVoteSchema,
  confirmCaptainsSchema,
} from "@/lib/validators/vote";

const UUID_A = "00000000-0000-0000-0000-000000000001";
const UUID_B = "00000000-0000-0000-0000-000000000002";

describe("castVoteSchema", () => {
  it("接受合法投票", () => {
    const r = castVoteSchema.safeParse({
      voterRegistrationId: UUID_A,
      candidateRegistrationId: UUID_B,
    });
    expect(r.success).toBe(true);
  });

  it("拒绝非 UUID", () => {
    const r = castVoteSchema.safeParse({
      voterRegistrationId: "not-uuid",
      candidateRegistrationId: UUID_B,
    });
    expect(r.success).toBe(false);
  });

  it("拒绝缺少字段", () => {
    const r = castVoteSchema.safeParse({
      voterRegistrationId: UUID_A,
    });
    expect(r.success).toBe(false);
  });
});

describe("retractVoteSchema", () => {
  it("接受合法撤销投票", () => {
    const r = retractVoteSchema.safeParse({
      voterRegistrationId: UUID_A,
      candidateRegistrationId: UUID_B,
    });
    expect(r.success).toBe(true);
  });
});

describe("confirmCaptainsSchema", () => {
  it("接受合法 seasonId", () => {
    const r = confirmCaptainsSchema.safeParse({
      seasonId: UUID_A,
    });
    expect(r.success).toBe(true);
  });

  it("拒绝非 UUID", () => {
    const r = confirmCaptainsSchema.safeParse({
      seasonId: "not-uuid",
    });
    expect(r.success).toBe(false);
  });
});
