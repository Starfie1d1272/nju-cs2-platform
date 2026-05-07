// 共享赛季类型——与 Drizzle schema 枚举对齐

export type SeasonKind = "rivals" | "major";

export type SeasonStatus =
  | "draft"
  | "registration"
  | "voting"
  | "drafting"
  | "playing"
  | "finished"
  | "archived";

export type RegistrationMode = "solo" | "team";
export type QualifierFormat = "round_robin" | "swiss";
export type PlayoffFormat = "double_elim" | "single_elim";

/**
 * Capability 字段——业务逻辑的唯一判断依据。
 * 禁止用 season.kind 做功能分支，统一读这组字段。
 *
 * @example
 * // ✅ 正确
 * if (season.hasDraft) { ... }
 *
 * // ❌ 禁止
 * if (season.kind === "rivals") { ... }
 */
export interface SeasonCapabilities {
  registrationMode: RegistrationMode;
  hasCaptainVoting: boolean;
  hasDraft: boolean;
  /** 排位赛赛制；null = 无排位赛阶段 */
  qualifierFormat: QualifierFormat | null;
  /** 正赛赛制；null = 无正赛阶段（如纯排位赛娱乐赛）*/
  playoffFormat: PlayoffFormat | null;
  teamSize: number;
  starterCount: number;
}

export interface Season extends SeasonCapabilities {
  id: string;
  slug: string;
  name: string;
  /** 仅用于展示与历史记录，业务逻辑勿用 */
  kind: SeasonKind;
  status: SeasonStatus;
  themeColor: string | null;
  startAt: Date | null;
  endAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ── 种子默认值 ────────────────────────────────────────────────────────────

/** Rivals 赛事的默认 capability 配置（排位赛 28 场 BO1 + 双败正赛）*/
export const RIVALS_DEFAULT_CAPABILITIES: SeasonCapabilities = {
  registrationMode: "solo",
  hasCaptainVoting: true,
  hasDraft: true,
  qualifierFormat: "round_robin",
  playoffFormat: "double_elim",
  teamSize: 7,
  starterCount: 5,
};

/** Major 赛事的默认 capability 配置（v2，自由组队 + 双败）*/
export const MAJOR_DEFAULT_CAPABILITIES: SeasonCapabilities = {
  registrationMode: "team",
  hasCaptainVoting: false,
  hasDraft: false,
  qualifierFormat: "round_robin",
  playoffFormat: "double_elim",
  teamSize: 5,
  starterCount: 5,
};

// ── 展示标签 ─────────────────────────────────────────────────────────────

export const SEASON_STATUS_LABELS: Record<SeasonStatus, string> = {
  draft: "未发布",
  registration: "报名中",
  voting: "投票中",
  drafting: "选秀中",
  playing: "进行中",
  finished: "已结束",
  archived: "已归档",
};
