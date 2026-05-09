import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { checkAdminSession } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await checkAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <div className="min-h-screen">
      <AdminNav email={session.email} />
      {children}
    </div>
  );
}
