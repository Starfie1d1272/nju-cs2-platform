import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

// Mock season data — replaced with DB query in Phase 4+
const MOCK_SEASONS: Record<string, {
  name: string;
  kind: string;
  status: string;
  description: string;
  themeColor: string;
  links: { href: string; label: string }[];
}> = {
  "2026-nju-rivals": {
    name: "2026 NJU Rivals",
    kind: "选秀联赛",
    status: "registration",
    description: "南京大学 CS2 社群选秀联赛，报名 → 队长投票 → 蛇形选秀 → 赛程对决。",
    themeColor: "#f97316",
    links: [
      { href: "register", label: "立即报名" },
      { href: "captains", label: "队长投票" },
      { href: "teams", label: "队伍阵容" },
      { href: "matches", label: "赛程 Bracket" },
    ],
  },
};

const STATUS_LABEL: Record<string, string> = {
  registration: "报名中",
  voting: "投票中",
  drafting: "选秀中",
  playing: "进行中",
  finished: "已结束",
  upcoming: "敬请期待",
};

interface SeasonPageProps {
  params: Promise<{ seasonSlug: string }>;
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { seasonSlug } = await params;
  const season = MOCK_SEASONS[seasonSlug];
  if (!season) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Theme color bar */}
      <div
        className="h-1 w-full mb-8 rounded-full"
        style={{ backgroundColor: "var(--season-primary)" }}
      />

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{season.name}</h1>
          <Badge>{STATUS_LABEL[season.status] ?? season.status}</Badge>
        </div>
        <p className="text-[var(--text-secondary)] text-sm mb-1">{season.kind}</p>
        <p className="text-[var(--text-secondary)] max-w-xl">{season.description}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {season.links.map((link) => (
          <Link
            key={link.href}
            href={`/${seasonSlug}/${link.href}` as never}
            className="flex items-center justify-center px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--season-primary)] transition-colors text-center"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
