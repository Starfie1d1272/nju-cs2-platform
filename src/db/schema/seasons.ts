import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

// `kind` 保留用于显示/归档标记，业务逻辑不得直接 if/switch kind
// 所有功能分支必须读 capability 字段（见下方）
export const seasonKindEnum = pgEnum("season_kind", ["rivals", "major"]);

export const seasonStatusEnum = pgEnum("season_status", [
  "draft",        // 未发布
  "registration", // 报名开放
  "voting",       // 队长投票
  "drafting",     // 蛇形选秀
  "playing",      // 正赛进行
  "finished",     // 赛季结束
  "archived",     // 历史归档
]);

// 报名模式：solo = 个人报名（Rivals），team = 队伍整体报名（Major v2）
export const registrationModeEnum = pgEnum("registration_mode", ["solo", "team"]);

// 排位赛 / 正赛各自的赛制（拆开是因为一个赛季可能两阶段不同制）
export const qualifierFormatEnum = pgEnum("qualifier_format", [
  "round_robin",  // 单循环（Rivals 排位赛：8 队 28 场 BO1）
  "swiss",        // 瑞士轮（备选）
]);
export const playoffFormatEnum = pgEnum("playoff_format", [
  "double_elim",  // 双败淘汰（Rivals 正赛默认）
  "single_elim",  // 单败淘汰
]);

export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: seasonKindEnum("kind").notNull(),           // 仅用于展示与历史记录
  status: seasonStatusEnum("status").notNull().default("draft"),
  themeColor: text("theme_color"),

  // ── Capability 字段（业务逻辑的唯一判断依据）──────────────────────────
  // 报名模式
  registrationMode: registrationModeEnum("registration_mode").notNull().default("solo"),
  // 是否有队长投票环节
  hasCaptainVoting: boolean("has_captain_voting").notNull().default(true),
  // 是否有蛇形选秀环节
  hasDraft: boolean("has_draft").notNull().default(true),
  // 排位赛赛制（null = 无排位赛阶段）
  qualifierFormat: qualifierFormatEnum("qualifier_format").default("round_robin"),
  // 正赛赛制（null = 无正赛阶段，纯排位赛）
  playoffFormat: playoffFormatEnum("playoff_format").default("double_elim"),
  // 每支队伍总人数（含队长）
  teamSize: integer("team_size").notNull().default(7),
  // 首发人数
  starterCount: integer("starter_count").notNull().default(5),
  // ──────────────────────────────────────────────────────────────────────

  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
