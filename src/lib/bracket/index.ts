// Bracket 适配层——所有 brackets-manager 调用必须经过此模块
// 禁止在业务代码中直接 import brackets-manager
//
// 阶段说明：一个赛季可有两个 stage——qualifier（排位赛）+ playoff（正赛）
// brackets-manager 原生支持多 stage，对应 BracketStage[] 数组
//
// BO5 总决赛胜者组冠军 2-ban 优势在 BP 模块处理（不在此适配层）
//
// TODO: Phase 11 实装各函数体

import type { Match } from "@/types/match";
import type { QualifierFormat, PlayoffFormat } from "@/types/season";

export interface BracketStage {
  id: number;
  name: string;
  type: "double_elimination" | "single_elimination" | "round_robin";
}

export interface BracketMatch {
  id: number;
  stageId: number;
  roundNumber: number;
  opponent1: { id: number; score: number | null; result?: "win" | "loss" } | null;
  opponent2: { id: number; score: number | null; result?: "win" | "loss" } | null;
}

export interface BracketData {
  stage: BracketStage[];
  match: BracketMatch[];
  participant: { id: number; name: string }[];
}

/**
 * 根据队伍列表与赛季 capability 初始化赛季 bracket 数据结构
 * 排位赛 + 正赛分别生成 stage（任一为 null 时不生成对应 stage）
 * 实现时调用 brackets-manager 的 manager.create()
 */
export async function generateBracket(
  _seasonId: string,
  _teamIds: string[],
  _config: {
    qualifierFormat: QualifierFormat | null;
    playoffFormat: PlayoffFormat | null;
  }
): Promise<BracketData> {
  throw new Error("not implemented");
}

/**
 * 推进一场比赛结果，更新 bracket 状态
 * 实现时调用 brackets-manager 的 manager.update.match()
 */
export async function advanceMatch(
  _seasonId: string,
  _match: Match
): Promise<void> {
  throw new Error("not implemented");
}

/**
 * 从数据库读取 bracket 数据，序列化为 brackets-viewer 可消费的格式
 */
export async function serializeBracket(
  _seasonId: string
): Promise<BracketData> {
  throw new Error("not implemented");
}
