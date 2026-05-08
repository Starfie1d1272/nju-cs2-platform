"use client";

import { useMemo, useState } from "react";
import type { DraftPlayerRow } from "@/lib/draft/data";
import { positionValues, POSITION_LABELS } from "@/lib/validators/registration";

interface PlayerPoolProps {
  players: DraftPlayerRow[];
}

export function PlayerPool({ players }: PlayerPoolProps) {
  const [filter, setFilter] = useState<string>("all");

  const grouped = useMemo(() => {
    const map = new Map<string, DraftPlayerRow[]>();
    for (const p of players) {
      const list = map.get(p.primaryPosition) ?? [];
      list.push(p);
      map.set(p.primaryPosition, list);
    }
    return map;
  }, [players]);

  const positions: readonly string[] =
    filter === "all"
      ? positionValues
      : positionValues.filter((v) => v === filter);

  const total = players.length;

  if (total === 0) {
    return (
      <div className="py-12 text-center text-[var(--text-muted)] text-sm">
        所有选手已被选完
      </div>
    );
  }

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            filter === "all"
              ? "bg-[var(--season-primary)] text-white"
              : "bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          全部 ({total})
        </button>
        {positionValues.map((pos) => {
          const count = grouped.get(pos)?.length ?? 0;
          return (
            <button
              key={pos}
              onClick={() => setFilter(pos === filter ? "all" : pos as string)}
              disabled={count === 0}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                pos === filter
                  ? "bg-[var(--season-primary)] text-white"
                  : "bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
              }`}
            >
              {POSITION_LABELS[pos as keyof typeof POSITION_LABELS]?.en ?? pos} ({count})
            </button>
          );
        })}
      </div>

      {/* 选手列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
        {positions.flatMap((pos) => {
          const list = grouped.get(pos) ?? [];
          return list.map((p) => (
            <div
              key={p.registrationId}
              className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)]"
            >
              <span className="text-[var(--text-primary)] truncate">
                {p.steamName}
              </span>
              <span className="text-[var(--text-muted)] tabular ml-1 shrink-0">
                {p.peakRank} {p.peakRating.toFixed(2)}
              </span>
            </div>
          ));
        })}
      </div>
    </div>
  );
}
