import { redirect } from "next/navigation";
import { checkAdminSession } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function AdminSettingsPage() {
  const admin = await checkAdminSession();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <AdminNav username={admin.adminUsername} />

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
