import { APP_BRAND } from "@/lib/branding";

// Phase 3 will detect the active season and redirect to /[seasonSlug] or show the season list.
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">{APP_BRAND.name}</h1>
      <p className="text-[var(--text-secondary)]">{APP_BRAND.description}</p>
    </div>
  );
}
