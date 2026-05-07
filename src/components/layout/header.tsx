import Link from "next/link";
import { APP_BRAND } from "@/lib/branding";

// Phase 3 will implement multi-season navigation and mobile menu behavior.
export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--text-primary)]">
          {APP_BRAND.name}
        </Link>
        {/* Phase 3: season navigation links */}
      </div>
    </header>
  );
}
