import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { checkAdminSession } from "@/lib/auth/session";
import { AdminUserList } from "@/components/admin/AdminUserList";

export default async function AdminUsersPage() {
  const admin = await checkAdminSession();
  if (!admin) redirect("/admin/login");

  const rows = await db
    .select()
    .from(adminUsers)
    .orderBy(adminUsers.createdAt);

  const users = rows.map((u) => ({
    ...u,
    createdAt: u.createdAt?.toISOString() ?? "",
    updatedAt: u.updatedAt?.toISOString() ?? "",
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
            <Link href="/admin" className="hover:text-[var(--text-primary)] transition-colors">
              赛季列表
            </Link>
            <Link href="/admin/invites" className="hover:text-[var(--text-primary)] transition-colors">
              邀请码
            </Link>
            <span className="text-[var(--text-primary)]">管理员</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">管理员列表</h1>
        <AdminUserList users={users} currentAdminId={admin.adminId} />
      </div>
    </div>
  );
}
