import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getUserSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { Marker } from "@/components/rivalhub";
import { ProfileForm } from "@/components/settings/ProfileForm";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: {
      displayName: true,
      steamName: true,
      perfectName: true,
      steam64: true,
      steamProfileUrl: true,
      qq: true,
      studentId: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="space-y-8">
        <div className="space-y-6">
          <Marker sub="修改后全站立即生效">个人信息</Marker>
          <ProfileForm
            current={{
              displayName: user?.displayName ?? null,
              steamName: user?.steamName ?? null,
              perfectName: user?.perfectName ?? null,
              steam64: user?.steam64 ?? null,
              steamProfileUrl: user?.steamProfileUrl ?? null,
              qq: user?.qq ?? null,
              studentId: user?.studentId ?? null,
            }}
          />
        </div>
        <div className="text-center">
          <Link
            href="/settings/password"
            className="text-sm text-[var(--color-fg-mid)] hover:text-[var(--color-accent)] underline"
          >
            修改密码
          </Link>
        </div>
      </div>
    </div>
  );
}
