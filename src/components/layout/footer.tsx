import { APP_BRAND } from "@/lib/branding";

// Phase 3 will expand this footer with season and community information.
export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
        <span>
          {APP_BRAND.footerLabel} · {new Date().getFullYear()}
        </span>
        <a
          href={APP_BRAND.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
