import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">管理员登录</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            请输入邀请码和密码以访问管理后台
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
