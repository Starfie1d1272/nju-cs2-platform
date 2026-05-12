import { checkAdminSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ENV_VARS = [
  {
    key: "STEAM_API_KEY",
    label: "Steam Web API Key",
    description: "用于抓取选手 Steam 头像。申请地址：steamcommunity.com/dev/apikey",
    required: false,
  },
  {
    key: "CRON_SECRET",
    label: "Vercel Cron Secret",
    description: "生产环境选秀超时自动 pick 所需，本地开发可不填。",
    required: false,
  },
] as const;

export default async function AdminSettingsPage() {
  const admin = (await checkAdminSession())!;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-10">
        <div>
          <h1 className="text-2xl font-bold mb-2">系统设置</h1>
          <p className="text-sm text-[var(--color-fg-mid)]">
            当前登录：{admin.email}
          </p>
        </div>

        {/* 修改密码 */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-[var(--color-fg)]">修改密码</h2>
          {admin.authSource === "root" ? (
            <ChangePasswordForm />
          ) : (
            <Card className="p-4 text-sm text-[var(--color-fg-mid)]">
              Magic Link 登录用户无需在后台修改密码。
            </Card>
          )}
        </section>

        {/* 环境变量状态 */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[var(--color-fg)]">环境变量状态</h2>
            <p className="text-xs text-[var(--color-fg-mid)]">
              这些配置需在服务器环境变量中设置（.env.local 或 Vercel Dashboard），不能通过界面修改。
            </p>
          </div>
          <Card className="p-0 overflow-hidden divide-y divide-[var(--color-border)]">
            {ENV_VARS.map(({ key, label, description, required }) => {
              const isSet = !!process.env[key];
              return (
                <div key={key} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-[var(--color-fg)]">{key}</code>
                      {required && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 text-red-500 border-red-500/30">
                          必填
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-fg-mid)]">{label}</p>
                    <p className="text-xs text-[var(--color-fg-mid)] opacity-70">{description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isSet
                        ? "text-green-600 border-green-500/30 bg-green-500/5 shrink-0"
                        : "text-[var(--color-fg-mid)] shrink-0"
                    }
                  >
                    {isSet ? "已配置" : "未配置"}
                  </Badge>
                </div>
              );
            })}
          </Card>
        </section>
    </div>
  );
}
