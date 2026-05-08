import { z } from "zod";

export const positionValues = ["entry", "awper", "support", "lurker", "igl"] as const;
export type Position = (typeof positionValues)[number];

export const POSITION_LABELS: Record<Position, { cn: string; en: string }> = {
  igl:     { cn: "指挥",   en: "IGL" },
  awper:   { cn: "狙击手", en: "AWPer" },
  entry:   { cn: "打手",   en: "Entry" },
  lurker:  { cn: "游走",   en: "Lurker" },
  support: { cn: "辅助",   en: "Support" },
};

export const registrationSchema = z.object({
  seasonId: z.string().uuid("赛季 ID 格式不正确"),

  email: z
    .string()
    .min(1, "请填写电子邮件")
    .email("请输入有效的电子邮件地址"),

  // 可选字符串用 .refine 代替 z.preprocess，避免破坏 RHF 类型推断
  steam64: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{17}$/.test(v), {
      message: "Steam64 ID 应为 17 位纯数字",
    }),

  qq: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{5,12}$/.test(v), {
      message: "请输入有效的 QQ 号（5-12 位数字）",
    }),

  primaryPosition: z.enum(positionValues, {
    errorMap: () => ({ message: "请选择主要位置" }),
  }),

  secondaryPosition: z.enum(positionValues).optional(),

  // 使用 RHF 的 setValueAs 把空字符串转成 undefined，schema 只处理数字
  peakRating: z
    .number()
    .int()
    .min(0, "评分不能为负")
    .max(50000, "评分最大 50000")
    .optional(),

  screenshotUrl: z
    .string()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), {
      message: "请输入有效的链接（以 http:// 或 https:// 开头）",
    }),

  willingToBeCaptain: z.boolean().default(false),

  notes: z.string().max(500, "备注不超过 500 字").optional(),

  antiCheatPledge: z.literal(true, {
    errorMap: () => ({ message: "请勾选反作弊承诺方可提交" }),
  }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// 每个主选位置的报名上限（软约束，管理员可豁免）
// 8 队 × 7 人 = 56，5 个位置各约 11，预留 buffer 到 15
export const MAX_PER_POSITION = 15;
