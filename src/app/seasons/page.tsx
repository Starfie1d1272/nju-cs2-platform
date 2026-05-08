import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "历史赛季" };

// Mock data — replaced with DB query in Phase 4+
const seasons = [
  {
    slug: "2026-nju-rivals",
    name: "2026 NJU Rivals",
    kind: "选秀联赛",
    status: "registration" as const,
    themeColor: "#f97316",
  },
];

const STATUS_CONFIG = {
  registration: { label: "报名中", variant: "default" as const },
  voting:       { label: "投票中", variant: "default" as const },
  drafting:     { label: "选秀中", variant: "default" as const },
  playing:      { label: "进行中", variant: "default" as const },
  finished:     { label: "已结束", variant: "secondary" as const },
  upcoming:     { label: "敬请期待", variant: "secondary" as const },
};

export default function SeasonsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">历史赛季</h1>
      <p className="text-[var(--text-secondary)] mb-8">所有赛季归档</p>

      {seasons.length === 0 ? (
        <p className="text-[var(--text-muted)] text-center py-16">暂无赛季记录</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((season) => {
            const cfg = STATUS_CONFIG[season.status] ?? STATUS_CONFIG.upcoming;
            return (
              <Link key={season.slug} href={`/${season.slug}`}>
                <Card className="bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--text-muted)] transition-colors cursor-pointer h-full">
                  <div
                    className="h-1 rounded-t-lg"
                    style={{ backgroundColor: season.themeColor }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-[var(--text-primary)] text-lg leading-tight">
                        {season.name}
                      </CardTitle>
                      <Badge variant={cfg.variant} className="shrink-0 text-xs">
                        {cfg.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[var(--text-muted)]">{season.kind}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
