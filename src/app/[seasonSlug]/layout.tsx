import type { Metadata } from "next";

// Mock season data — replaced with DB query in Phase 4+
const MOCK_SEASONS: Record<string, { name: string; themeColor: string }> = {
  "2026-nju-rivals": { name: "2026 NJU Rivals", themeColor: "#f97316" },
};

interface SeasonLayoutProps {
  children: React.ReactNode;
  params: Promise<{ seasonSlug: string }>;
}

export async function generateMetadata({ params }: SeasonLayoutProps): Promise<Metadata> {
  const { seasonSlug } = await params;
  const season = MOCK_SEASONS[seasonSlug];
  return {
    title: season?.name ?? seasonSlug,
  };
}

export default async function SeasonLayout({ children, params }: SeasonLayoutProps) {
  const { seasonSlug } = await params;
  const season = MOCK_SEASONS[seasonSlug];
  const themeColor = season?.themeColor ?? "#f97316";

  return (
    <div
      data-season={seasonSlug}
      style={{ "--season-primary": themeColor } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
