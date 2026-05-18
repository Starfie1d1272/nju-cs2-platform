// CS2 单图玩家数据合法范围
export const STAT_RANGES = {
  kills:      [0, 40],
  deaths:     [0, 30],
  assists:    [0, 30],
  hsPercent:  [0, 100],
  firstKills: [0, 20],
  multiKills: [0, 30],
  clutches:   [0, 10],
  adr:        [0, 200],
  rws:        [0, 100],
  ratingPro:  [0.01, 3.5],
} as const satisfies Record<string, readonly [number, number]>;

export type StatRangeKey = keyof typeof STAT_RANGES;

export function isStatOutOfRange(key: string, value: number | null): boolean {
  if (value === null) return false;
  const range = STAT_RANGES[key as StatRangeKey];
  if (!range) return false;
  return value < range[0] || value > range[1];
}
