import { describe, expect, it } from "vitest";
import {
  startDraftSchema,
  pauseDraftSchema,
  resumeDraftSchema,
} from "@/lib/validators/draft";

const UUID = "00000000-0000-0000-0000-000000000001";

describe("startDraftSchema", () => {
  it("接受合法 seasonId", () => {
    const r = startDraftSchema.safeParse({ seasonId: UUID });
    expect(r.success).toBe(true);
  });

  it("拒绝非 UUID", () => {
    const r = startDraftSchema.safeParse({ seasonId: "not-uuid" });
    expect(r.success).toBe(false);
  });

  it("拒绝缺少 seasonId", () => {
    const r = startDraftSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("pauseDraftSchema", () => {
  it("接受合法 seasonId", () => {
    const r = pauseDraftSchema.safeParse({ seasonId: UUID });
    expect(r.success).toBe(true);
  });
});

describe("resumeDraftSchema", () => {
  it("接受合法 seasonId", () => {
    const r = resumeDraftSchema.safeParse({ seasonId: UUID });
    expect(r.success).toBe(true);
  });
});
