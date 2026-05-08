"use server";

import { createServiceClient } from "@/lib/auth/supabase";
import { ok, fail } from "@/types/action";
import { ErrorCode } from "@/lib/errors";
import type { ActionResult } from "@/types/action";

export async function sendMagicLink(email: string): Promise<ActionResult<{ email: string }>> {
  if (!email || !email.includes("@")) {
    return fail({ code: ErrorCode.VALIDATION_FAILED, message: "请输入有效的邮箱地址" });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // 登录页只允许已有账号登录
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      // Supabase 对不存在的邮箱也返回成功（防枚举），仅记录日志
      console.warn("[sendMagicLink]", error.message);
    }

    return ok({ email });
  } catch (e) {
    console.error("[sendMagicLink]", e);
    return fail({ code: ErrorCode.INTERNAL_ERROR, message: "发送失败，请稍后重试" });
  }
}
