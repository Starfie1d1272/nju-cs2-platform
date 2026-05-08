import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_BRAND } from "@/lib/branding";

type SeasonStatus = "registration" | "voting" | "drafting" | "playing" | "finished" | "upcoming";

const STATUS_CONFIG: Record<SeasonStatus, { label: string; variant: "default" | "secondary" }> = {
  registration: { label: "报名中",   variant: "default" },
  voting:       { label: "投票中",   variant: "default" },
  drafting:     { label: "选秀中",   variant: "default" },
  playing:      { label: "进行中",   variant: "default" },
  finished:     { label: "已结束",   variant: "secondary" },
  upcoming:     { label: "敬请期待", variant: "secondary" },
};

// Mock data — replaced with DB query in Phase 4+
const seasons: Array<{ slug: string; name: string; kind: string; status: SeasonStatus; themeColor: string }> = [
  { slug: "2026-nju-rivals", name: "2026 NJU Rivals", kind: "选秀联赛", status: "registration", themeColor: "#f97316" },
];

export default function HomePage() {
  const activeSeasons = seasons.filter((s) => s.status !== "finished");

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
          {APP_BRAND.name}
        </h1>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          {APP_BRAND.description}
        </p>
      </div>

      {/* Seasons */}
      {activeSeasons.length > 0 ? (
        <>
          <h2 className="text-lg font-semibold text-[var(--text-secondary)] mb-4">当前赛季</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasons.map((season) => {
              const cfg = STATUS_CONFIG[season.status];
              return (
                <Link key={season.slug} href={`/${season.slug}` as never}>
                  <Card className="bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--text-muted)] transition-colors cursor-pointer h-full">
                    <div className="h-1 rounded-t-lg" style={{ backgroundColor: season.themeColor }} />
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
        </>
      ) : (
        <div className="text-center text-[var(--text-secondary)] py-16">
          <p className="text-lg mb-2">暂无进行中的赛季</p>
          <Link href="/seasons" className="text-sm underline hover:text-[var(--text-primary)]">
            查看历史赛季
          </Link>
        </div>
      )}
    </div>
  );
}
