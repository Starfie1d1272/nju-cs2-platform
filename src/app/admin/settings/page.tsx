import { redirect } from "next/navigation";
import Link from "next/link";
import { checkAdminSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function AdminSettingsPage() {
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
            <Link href="/admin" className="hover:text-[var(--text-primary)] transition-colors">
              赛季列表
            </Link>
            <Link href="/admin/invites" className="hover:text-[var(--text-primary)] transition-colors">
              邀请码
            </Link>
            <Link href="/admin/users" className="hover:text-[var(--text-primary)] transition-colors">
              管理员
            </Link>
            <span className="text-[var(--text-primary)]">修改密码</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-2xl font-bold mb-2">修改密码</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          当前登录：{admin.adminUsername}
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
