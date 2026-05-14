"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema/users";
import { createServiceClient } from "@/lib/auth/supabase";
import { requireAuth } from "@/lib/auth/session";
import { ok, fail } from "@/types/action";
import { failValidation, actionError } from "@/lib/action-utils";
import { ErrorCode } from "@/lib/errors";
import { AppError } from "@/lib/errors";
import type { ActionResult } from "@/types/action";

export async function changeUserPassword(
  oldPassword: string,
  newPassword: string,
): Promise<ActionResult<void>> {
  if (!oldPassword) return failValidation("请输入原密码");
  if (!newPassword || newPassword.length < 6) return failValidation("新密码至少 6 位");
  if (oldPassword === newPassword) return failValidation("新密码不能与原密码相同");

  try {
    const session = await requireAuth();

    // 验证原密码
    const supabase = createServiceClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.email,
      password: oldPassword,
    });
    if (signInError) {
      return fail({ code: ErrorCode.UNAUTHORIZED, message: "原密码错误" });
    }

    // 查 authId
    const userRow = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
      columns: { authId: true },
    });
    if (!userRow?.authId) {
      throw new AppError(ErrorCode.NOT_FOUND, "用户不存在");
    }

    // 更新密码
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userRow.authId,
      { password: newPassword },
    );
    if (updateError) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, "密码更新失败，请重试");
    }

    return ok(undefined);
  } catch (e) {
    return actionError("changeUserPassword", e);
  }
}
