import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { adminInvites } from "@/db/schema";
import { checkAdminSession } from "@/lib/auth/session";
import { InviteManager } from "@/components/admin/InviteManager";
import Link from "next/link";

export default async function AdminInvitesPage() {
  const admin = await checkAdminSession();
  if (!admin) redirect("/admin/login");

  const rows = await db
    .select()
    .from(adminInvites)
    .orderBy(desc(adminInvites.createdAt))
    .limit(50);

  const invites = rows.map((r) => ({
    ...r,
    expiresAt: r.expiresAt?.toISOString() ?? null,
    createdAt: r.createdAt?.toISOString() ?? "",
  }));

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
            <Link
              href="/admin"
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              赛季列表
            </Link>
            <span className="text-[var(--text-primary)]">邀请码</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">邀请码管理</h1>
        <InviteManager invites={invites} />
      </div>
    </div>
  );
}
