import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { checkAdminSession } from "@/lib/auth/session";
import Link from "next/link";

export default async function AdminSeasonLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await checkAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/50">
        <div className="container mx-auto px-4 h-12 flex items-center gap-6 text-sm">
          <Link
            href="/admin"
            className="font-semibold text-[var(--text-primary)]"
          >
            管理后台
          </Link>
          <nav className="flex items-center gap-4 text-[var(--text-secondary)]">
            <Link href="/admin" className="hover:text-[var(--text-primary)] transition-colors">赛季列表</Link>
            <Link href="/admin/invites" className="hover:text-[var(--text-primary)] transition-colors">邀请码</Link>
            <Link href="/admin/users" className="hover:text-[var(--text-primary)] transition-colors">管理员</Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
